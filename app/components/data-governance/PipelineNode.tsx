'use client';

import useCountUp from './useCountUp';

interface PipelineNodeProps {
  id: string;
  label: string;
  sub: string;
  tag?: string;
  stream: 'a' | 'b' | 'merge' | 'out';
  active: boolean;
  onClick: (id: string) => void;
  inputCount?: number;
  outputCount?: number;
}

export default function PipelineNode({
  id,
  label,
  sub,
  tag,
  stream,
  active,
  onClick,
  inputCount,
  outputCount,
}: PipelineNodeProps) {
  const animatedInput = useCountUp(inputCount || 0, 1500, 300);
  const animatedOutput = useCountUp(outputCount || 0, 1500, 600);
  const showCount = inputCount != null && outputCount != null;
  const hasReduction = showCount && inputCount !== outputCount;

  return (
    <div
      className={`agri-node stream-${stream}${active ? ' active' : ''}`}
      onClick={() => onClick(id)}
    >
      <div className="agri-node-label">{label}</div>
      <div className="agri-node-sub">{sub}</div>
      {tag && <span className="agri-node-tag">{tag}</span>}
      {showCount && (
        <div className="agri-node-count">
          {hasReduction ? (
            <>
              <span className="count-in">{animatedInput.toLocaleString()}</span>
              <span className="count-arrow">→</span>
              <span className="count-out">{animatedOutput.toLocaleString()}</span>
              <span className="count-unit">条</span>
            </>
          ) : (
            <>
              <span className="count-out">{animatedOutput.toLocaleString()}</span>
              <span className="count-unit">条</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
