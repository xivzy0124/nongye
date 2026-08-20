'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  FIELD_POOL,
  FIELD_BY_ID,
  FATES,
  FATE_ORDER,
  FATE_COUNT,
  TERMINAL,
  STAGES,
  type AgriField,
  type FieldFate,
} from '../../data/fieldFunnelData';

const HALF_W = 150;
const HALF_D = 92;
const BOUND_X = HALF_W * 0.82;
const BOUND_D = HALF_D * 0.82;
const TOP_Y = STAGES[0].y + 40;

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if ((ctx as any).roundRect) {
    (ctx as any).roundRect(x, y, w, h, r);
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
}

function makePlaneTexture() {
  const w = 512;
  const h = 320;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d')!;
  const pad = 14;
  const r = 54;
  ctx.beginPath();
  roundRectPath(ctx, pad, pad, w - 2 * pad, h - 2 * pad, r);
  const g = ctx.createLinearGradient(0, 0, 0, h);
  g.addColorStop(0, 'rgba(0, 242, 255, 0.18)');
  g.addColorStop(1, 'rgba(0, 120, 180, 0.08)');
  ctx.fillStyle = g;
  ctx.fill();
  ctx.lineWidth = 10;
  ctx.strokeStyle = 'rgba(0, 242, 255, 0.15)';
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(0, 242, 255, 0.75)';
  ctx.stroke();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

interface Particle {
  mesh: THREE.Mesh;
  mat: THREE.MeshStandardMaterial;
  labelEl: HTMLDivElement;
  field: AgriField;
  terminal: number;
  dim: number;
  boost: number;
  x: number;
  y: number;
  z: number;
  r: number;
  phase: number;
  vy: number;
  alpha: number;
  fading: boolean;
  state: 'collect' | 'falling' | 'settled';
  timer: number;
  dvx: number;
  dvz: number;
}

export default function FieldFunnel3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const labelsRef = useRef<HTMLDivElement>(null);
  const ballLabelsRef = useRef<HTMLDivElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);

  const [selected, setSelected] = useState<string | null>(null);
  const [hoverField, setHoverField] = useState<string | null>(null);
  const [fateHi, setFateHi] = useState<FieldFate | null>(null);

  const selectedRef = useRef<string | null>(null);
  const hoverRef = useRef<string | null>(null);
  const fateRef = useRef<FieldFate | null>(null);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  useEffect(() => {
    hoverRef.current = hoverField;
  }, [hoverField]);
  useEffect(() => {
    fateRef.current = fateHi;
  }, [fateHi]);

  useEffect(() => {
    const container = mountRef.current;
    const labelLayer = labelsRef.current;
    const ballLayer = ballLabelsRef.current;
    const tipEl = tipRef.current;
    if (!container || !labelLayer || !ballLayer || !tipEl) return;

    let width = container.clientWidth || 800;
    let height = container.clientHeight || 540;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, width / height, 1, 4000);
    camera.position.set(0, 215, 560);
    camera.lookAt(0, -10, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    renderer.domElement.style.cursor = 'grab';

    scene.add(new THREE.HemisphereLight(0xbcd0ff, 0x1a2030, 0.95));
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.95);
    keyLight.position.set(140, 320, 220);
    scene.add(keyLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.target.set(0, -10, 0);
    controls.minDistance = 360;
    controls.maxDistance = 880;
    controls.minPolarAngle = 0.5;
    controls.maxPolarAngle = 1.35;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.3;

    const planeTex = makePlaneTexture();
    const planeGeo = new THREE.PlaneGeometry(HALF_W * 2, HALF_D * 2);
    const stageObjs: { mesh: THREE.Mesh; labelEl: HTMLDivElement; st: (typeof STAGES)[0] }[] = [];

    STAGES.forEach((st) => {
      const mat = new THREE.MeshBasicMaterial({
        map: planeTex,
        color: new THREE.Color('#00f2ff'),
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(planeGeo, mat);
      mesh.rotation.x = -Math.PI / 2;
      mesh.position.set(0, st.y, 0);
      scene.add(mesh);

      const labelEl = document.createElement('div');
      labelEl.className = 'ff-label';
      labelEl.innerHTML = `<b>${st.label}</b><span>${st.sub}</span>`;
      labelLayer.appendChild(labelEl);
      stageObjs.push({ mesh, labelEl, st });
    });

    const threadMat = new THREE.LineBasicMaterial({ color: 0x9fb0ff, transparent: true, opacity: 0.1 });
    for (let i = 0; i < 16; i += 1) {
      const tx = (Math.random() * 2 - 1) * HALF_W * 0.92;
      const tz = (Math.random() * 2 - 1) * HALF_D * 0.92;
      const geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(tx, TOP_Y, tz),
        new THREE.Vector3(tx * 0.4, STAGES[STAGES.length - 1].y, tz * 0.4),
      ]);
      scene.add(new THREE.Line(geo, threadMat));
    }

    const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
    const particles: Particle[] = [];
    const pickables: THREE.Mesh[] = [];
    let now = 0;

    function randDrift(p: Particle, speed: number) {
      const a = Math.random() * Math.PI * 2;
      p.dvx = Math.cos(a) * speed;
      p.dvz = Math.sin(a) * speed;
    }

    function respawn(p: Particle, scatter: boolean) {
      p.x = (Math.random() * 2 - 1) * BOUND_X;
      p.z = (Math.random() * 2 - 1) * BOUND_D;
      p.r = 6 + Math.random() * 3;
      p.phase = Math.random() * Math.PI * 2;
      p.vy = 24 + Math.random() * 12;
      p.alpha = 1;
      p.fading = false;
      randDrift(p, 5 + Math.random() * 5);
      if (scatter) {
        const term = p.terminal;
        const stg = Math.floor(Math.random() * (term + 1));
        if (stg === term) {
          p.state = 'settled';
          p.y = STAGES[term].y + p.r;
          p.timer = now + Math.random() * 12;
        } else {
          p.state = 'falling';
          p.y = STAGES[stg].y - Math.random() * (STAGES[stg].y - STAGES[stg + 1].y);
        }
      } else {
        p.state = 'collect';
        p.y = STAGES[0].y + p.r;
        p.timer = now + 1.4 + Math.random() * 2.4;
      }
    }

    FIELD_POOL.forEach((field) => {
      const color = new THREE.Color(FATES[field.fate].color);
      const mat = new THREE.MeshStandardMaterial({
        color: color.clone(),
        roughness: 0.85,
        metalness: 0,
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(sphereGeo, mat);
      mesh.userData.idx = particles.length;
      scene.add(mesh);
      pickables.push(mesh);
      const labelEl = document.createElement('div');
      labelEl.className = 'ff-ball-label';
      labelEl.textContent = field.name;
      labelEl.style.setProperty('--fc', FATES[field.fate].color);
      ballLayer.appendChild(labelEl);
      const p: Particle = {
        mesh,
        mat,
        labelEl,
        field,
        terminal: TERMINAL[field.fate],
        dim: 0,
        boost: 0,
        x: 0,
        y: 0,
        z: 0,
        r: 0,
        phase: 0,
        vy: 0,
        alpha: 1,
        fading: false,
        state: 'collect',
        timer: 0,
        dvx: 0,
        dvz: 0,
      };
      respawn(p, true);
      particles.push(p);
    });

    function driftOnPlane(p: Particle, dt: number) {
      p.x += p.dvx * dt;
      p.z += p.dvz * dt;
      if (p.x > BOUND_X || p.x < -BOUND_X) {
        p.dvx *= -1;
        p.x = Math.max(-BOUND_X, Math.min(BOUND_X, p.x));
      }
      if (p.z > BOUND_D || p.z < -BOUND_D) {
        p.dvz *= -1;
        p.z = Math.max(-BOUND_D, Math.min(BOUND_D, p.z));
      }
    }

    function separate(list: Particle[]) {
      for (let i = 0; i < list.length; i += 1) {
        const a = list[i];
        for (let j = i + 1; j < list.length; j += 1) {
          const b = list[j];
          let dx = a.x - b.x;
          let dz = a.z - b.z;
          const minD = (a.r + b.r) * 0.92;
          let d = Math.hypot(dx, dz);
          if (d >= minD) continue;
          if (d < 1e-3) {
            dx = Math.random() - 0.5;
            dz = Math.random() - 0.5;
            d = Math.hypot(dx, dz) || 1;
          }
          const push = (minD - d) * 0.5;
          const ux = dx / d;
          const uz = dz / d;
          a.x += ux * push;
          a.z += uz * push;
          b.x -= ux * push;
          b.z -= uz * push;
        }
      }
      list.forEach((p) => {
        p.x = Math.max(-BOUND_X, Math.min(BOUND_X, p.x));
        p.z = Math.max(-BOUND_D, Math.min(BOUND_D, p.z));
      });
    }

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    let downX = 0;
    let downY = 0;
    let lastHover: string | null = null;

    function pickIdx(clientX: number, clientY: number) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickables, false);
      for (const h of hits) {
        const p = particles[(h.object as THREE.Mesh).userData.idx as number];
        if (!p.fading && p.alpha > 0.5) return (h.object as THREE.Mesh).userData.idx as number;
      }
      return -1;
    }

    function onMove(ev: PointerEvent) {
      const idx = pickIdx(ev.clientX, ev.clientY);
      const id = idx >= 0 ? particles[idx].field.id : null;
      renderer.domElement.style.cursor = id ? 'pointer' : 'grab';
      if (id !== lastHover) {
        lastHover = id;
        setHoverField(id);
      }
      if (!container || !tipEl) return;
      const rect = container.getBoundingClientRect();
      if (id) {
        const f = FIELD_BY_ID[id];
        tipEl.style.display = '';
        tipEl.style.setProperty('--tc', FATES[f.fate].color);
        tipEl.innerHTML = `<b>${f.name}</b><span>${f.cn} · ${FATES[f.fate].label}</span>`;
        tipEl.style.left = `${ev.clientX - rect.left + 14}px`;
        tipEl.style.top = `${ev.clientY - rect.top + 14}px`;
      } else {
        tipEl.style.display = 'none';
      }
    }

    function onLeave() {
      lastHover = null;
      setHoverField(null);
      if (tipEl) tipEl.style.display = 'none';
    }

    function onDown(ev: PointerEvent) {
      downX = ev.clientX;
      downY = ev.clientY;
    }

    function onUp(ev: PointerEvent) {
      if (Math.hypot(ev.clientX - downX, ev.clientY - downY) > 5) return;
      const idx = pickIdx(ev.clientX, ev.clientY);
      const id = idx >= 0 ? particles[idx].field.id : null;
      setSelected((prev) => (id ? (prev === id ? null : id) : prev));
    }

    const dom = renderer.domElement;
    dom.addEventListener('pointermove', onMove);
    dom.addEventListener('pointerleave', onLeave);
    dom.addEventListener('pointerdown', onDown);
    dom.addEventListener('pointerup', onUp);

    let lastTime = performance.now();
    let elapsed = 0;
    const tmp = new THREE.Vector3();
    const lp = new THREE.Vector3();
    const restGroups: Particle[][] = STAGES.map(() => []);
    let raf = 0;

    function animate() {
      raf = requestAnimationFrame(animate);
      const currentTime = performance.now();
      const dt = Math.min(0.05, (currentTime - lastTime) / 1000);
      lastTime = currentTime;
      elapsed += dt;
      now = elapsed;

      const sel = selectedRef.current;
      const fate = fateRef.current;
      const hov = hoverRef.current;
      const anyFocus = sel || fate || hov;
      controls.autoRotate = !(sel || hov);

      particles.forEach((p) => {
        const bob = Math.sin(now * 1.4 + p.phase) * 1.4;
        if (p.state === 'collect') {
          p.y = STAGES[0].y + p.r + bob;
          driftOnPlane(p, dt);
          if (now > p.timer) p.state = 'falling';
        } else if (p.state === 'falling') {
          p.y -= p.vy * dt;
          const termY = STAGES[p.terminal].y;
          if (p.y <= termY + p.r) {
            p.state = 'settled';
            p.y = termY + p.r;
            p.timer = now + 8 + Math.random() * 9;
          }
        } else if (p.state === 'settled') {
          if (p.field.fate === 'merge') {
            p.x += (0 - p.x) * Math.min(1, dt * 0.6);
            p.z += (0 - p.z) * Math.min(1, dt * 0.6);
          } else {
            driftOnPlane(p, dt);
          }
          p.y = STAGES[p.terminal].y + p.r + bob;
          if (now > p.timer) p.fading = true;
          if (p.fading) {
            p.alpha -= dt * 0.5;
            if (p.alpha <= 0) respawn(p, false);
          }
        }

        const isFocus = sel
          ? p.field.id === sel
          : fate
            ? p.field.fate === fate
            : hov
              ? p.field.id === hov
              : false;
        p.dim += ((anyFocus && !isFocus ? 1 : 0) - p.dim) * 0.16;
        p.boost += ((isFocus ? 1 : 0) - p.boost) * 0.16;
      });

      restGroups.forEach((g) => {
        g.length = 0;
      });
      particles.forEach((p) => {
        if (p.fading) return;
        if (p.state === 'settled') restGroups[p.terminal].push(p);
        else if (p.state === 'collect') restGroups[0].push(p);
      });
      restGroups.forEach((g) => {
        if (g.length > 1) separate(g);
      });

      particles.forEach((p) => {
        const pulse = 1 + 0.05 * Math.sin(now * 2.5 + p.phase) + 0.32 * p.boost;
        const opacityFactor = 1 - 0.86 * p.dim;
        p.mesh.position.set(p.x, p.y, p.z);
        p.mesh.scale.setScalar(p.r * pulse);
        p.mat.opacity = p.alpha * opacityFactor;

        const el = p.labelEl;
        lp.copy(p.mesh.position);
        lp.y += p.r + 6;
        lp.project(camera);
        if (lp.z > 1 || p.alpha < 0.55) {
          el.style.display = 'none';
        } else {
          el.style.display = '';
          const lx = (lp.x * 0.5 + 0.5) * width;
          const ly = (-lp.y * 0.5 + 0.5) * height;
          el.style.transform = `translate(${lx}px, ${ly}px) translate(-50%, -100%)`;
          el.style.opacity = String(opacityFactor * Math.min(1, p.alpha));
          el.style.zIndex = p.boost > 0.5 ? '4' : '';
        }
      });

      stageObjs.forEach((o) => {
        tmp.set(HALF_W + 6, o.st.y, -HALF_D);
        tmp.project(camera);
        const el = o.labelEl;
        if (tmp.z > 1) {
          el.style.display = 'none';
          return;
        }
        el.style.display = '';
        const x = (tmp.x * 0.5 + 0.5) * width;
        const y = (-tmp.y * 0.5 + 0.5) * height;
        el.style.transform = `translate(${x}px, ${y}px) translateY(-50%)`;
      });

      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    const ro = new ResizeObserver(() => {
      width = container.clientWidth || width;
      height = container.clientHeight || height;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      dom.removeEventListener('pointermove', onMove);
      dom.removeEventListener('pointerleave', onLeave);
      dom.removeEventListener('pointerdown', onDown);
      dom.removeEventListener('pointerup', onUp);
      controls.dispose();
      sphereGeo.dispose();
      planeGeo.dispose();
      planeTex.dispose();
      scene.traverse((obj) => {
        if ((obj as any).geometry) (obj as any).geometry.dispose();
        if ((obj as any).material) {
          const mats = Array.isArray((obj as any).material) ? (obj as any).material : [(obj as any).material];
          mats.forEach((m: any) => {
            if (m.map) m.map.dispose();
            m.dispose();
          });
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      labelLayer.replaceChildren();
      ballLayer.replaceChildren();
    };
  }, []);

  const shown = selected ? FIELD_BY_ID[selected] : hoverField ? FIELD_BY_ID[hoverField] : null;
  const toVerb: Record<FieldFate, string> = {
    filter: '✕ 过滤剔除，不入库',
    rename: '重命名为 ',
    merge: '归并入 ',
    derive: '派生计算 → ',
    direct: '原样保留 ',
  };

  return (
    <div className="ff-section">
      <div className="ff-stage" ref={mountRef}>
        <div className="ff-ball-labels" ref={ballLabelsRef} />
        <div className="ff-labels" ref={labelsRef} />
        <div className="ff-tip" ref={tipRef} />
        <div className="ff-hint">悬停看字段 · 点击钉住高亮 · 拖拽旋转 · 滚轮缩放</div>
      </div>

      <aside className="ff-side">
        <div className="ff-funnel">
          <div className="ff-funnel-top"><strong>{FIELD_POOL.length}</strong> 源字段</div>
          <div className="ff-funnel-arrow">过滤 · 映射 · 融合 ↓</div>
          <div className="ff-funnel-bottom">
            <strong>{FIELD_POOL.length - FATE_COUNT.filter}</strong> 标准化字段入库
          </div>
        </div>

        <div className="ff-fates">
          <div className="ff-fates-title">字段级转换类型</div>
          {FATE_ORDER.map((k) => {
            const f = FATES[k];
            const active = fateHi === k;
            return (
              <button
                key={k}
                type="button"
                className={`ff-fate-row${active ? ' active' : ''}`}
                style={{ '--fc': f.color } as React.CSSProperties}
                onClick={() => setFateHi((p) => (p === k ? null : k))}
                onMouseEnter={() => !selected && setFateHi(k)}
                onMouseLeave={() => !selected && setFateHi((p) => (p === k ? null : p))}
              >
                <i className="ff-fate-dot" />
                <span className="ff-fate-label">{f.label}</span>
                <span className="ff-fate-sub">{f.en} · {f.sub}</span>
                <span className="ff-fate-count">{k === 'merge' ? `${FATE_COUNT.merge}→3` : FATE_COUNT[k]}</span>
              </button>
            );
          })}
        </div>

        <div className="ff-detail">
          {shown ? (
            <div className="ff-detail-card" style={{ '--fc': FATES[shown.fate].color } as React.CSSProperties}>
              <div className="ff-detail-head">
                <h4>{shown.cn}</h4>
                {selected && (
                  <button className="ff-detail-close" onClick={() => setSelected(null)}>×</button>
                )}
              </div>
              <code className="ff-detail-name">{shown.name}</code>
              <div className="ff-detail-badges">
                <span className="ff-badge ff-badge-fate">{FATES[shown.fate].label}</span>
                <span className="ff-badge">{shown.type}</span>
                <span className="ff-badge">{shown.cat}</span>
              </div>
              <p className="ff-detail-rule">{shown.rule}</p>
              <div className="ff-detail-to">
                <span className="ff-detail-to-label">转换结果</span>
                {shown.fate === 'filter' ? (
                  <span className="ff-detail-to-drop">{toVerb.filter}</span>
                ) : (
                  <span className="ff-detail-to-name">
                    {toVerb[shown.fate]}<code>{shown.to}</code>
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="ff-detail-empty">
              悬停或点击左侧小球查看字段详情<br />
              点击右侧转换类型可高亮该类全部字段
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
