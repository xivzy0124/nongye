import React from 'react';

interface PanelProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
  icon?: React.ReactNode;
}

export default function Panel({ title, children, className = '', delay = 0, icon }: PanelProps) {
  const cornerClass = "absolute w-3 h-3 border-cyan-400/70";

  return (
    <div
      className={`relative h-full rounded-sm bg-[#08101e]/85 border border-cyan-500/20 overflow-hidden panel-animate group ${className}`}
      style={{
        boxShadow: '0 0 25px rgba(0, 200, 255, 0.08), inset 0 0 40px rgba(0, 100, 150, 0.06)',
        animationDelay: `${delay}ms`
      }}
    >
      {/* 四角装饰 */}
      <div className={`${cornerClass} top-0 left-0 border-l-[1.5px] border-t-[1.5px]`}></div>
      <div className={`${cornerClass} top-0 right-0 border-r-[1.5px] border-t-[1.5px]`}></div>
      <div className={`${cornerClass} bottom-0 left-0 border-l-[1.5px] border-b-[1.5px]`}></div>
      <div className={`${cornerClass} bottom-0 right-0 border-r-[1.5px] border-b-[1.5px]`}></div>

      {/* 背景渐变 */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.04] via-transparent to-cyan-500/[0.04] pointer-events-none"></div>

      {/* 顶部扫描线 */}
      <div className="scan-line opacity-30 pointer-events-none"></div>

      {/* 顶部/底部发光线条 */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent"></div>

      {/* 悬浮闪光层 */}
      <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0"></div>

      <div className="h-full flex flex-col relative z-10">
        {title && (
          <div className="text-center pt-2 pb-1 px-4 relative flex-shrink-0">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-px bg-gradient-to-r from-transparent to-cyan-400/60"></div>
            <div className="absolute left-12 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-cyan-400/60"></div>

            <h3 className="text-cyan-200 text-[11px] font-bold tracking-[0.2em] drop-shadow-[0_0_8px_rgba(0,200,255,0.6)] flex items-center justify-center gap-1.5 group-hover:text-cyan-100 transition-colors">
              {icon && <span className="text-cyan-400/80 float">{icon}</span>}
              {title}
            </h3>

            <div className="absolute right-12 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-cyan-400/60"></div>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-px bg-gradient-to-l from-transparent to-cyan-400/60"></div>
          </div>
        )}
        <div className="flex-1 min-h-0 px-1.5 pb-1.5">
          {children}
        </div>
      </div>
    </div>
  );
}
