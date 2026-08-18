'use client';

import { Recommendation } from '../../data/reportMockData';

const priorityMap = {
  high: { label: '高', bg: 'bg-red-500/15', text: 'text-red-400', border: 'border-red-500/40' },
  medium: { label: '中', bg: 'bg-yellow-500/15', text: 'text-yellow-400', border: 'border-yellow-500/40' },
  low: { label: '低', bg: 'bg-cyan-500/15', text: 'text-cyan-400', border: 'border-cyan-500/40' },
};

export default function RecommendationsTable({ recommendations }: { recommendations: Recommendation[] }) {
  return (
    <div className="h-full flex flex-col">
      <h3 className="text-cyan-200 text-xs font-bold tracking-wider mb-2 flex items-center gap-1.5">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 scale-pulse"></span>
        AI 决策建议
      </h3>
      <div className="flex-1 min-h-0 overflow-auto scrollbar-hide">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="text-[10px] text-cyan-400/80 border-b border-cyan-500/20 bg-[#08101e]/95">
              <th className="py-2 pl-2 font-medium">优先级</th>
              <th className="py-2 font-medium">类别</th>
              <th className="py-2 font-medium">建议内容</th>
              <th className="py-2 font-medium">预期影响</th>
              <th className="py-2 pr-2 font-medium text-right">置信度</th>
            </tr>
          </thead>
          <tbody className="text-[11px]">
            {recommendations.map((rec, idx) => {
              const p = priorityMap[rec.priority];
              return (
                <tr
                  key={rec.id}
                  className="border-b border-cyan-500/10 hover:bg-cyan-500/5 transition-colors cursor-pointer group"
                  style={{ animationDelay: `${idx * 80}ms` }}
                >
                  <td className="py-2 pl-2">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] border ${p.bg} ${p.text} ${p.border}`}>
                      {p.label}
                    </span>
                  </td>
                  <td className="py-2 text-cyan-200/90">{rec.category}</td>
                  <td className="py-2 text-cyan-100 pr-2">
                    <span className="group-hover:text-cyan-300 transition-colors">{rec.title}</span>
                  </td>
                  <td className="py-2 text-green-400/90">{rec.impact}</td>
                  <td className="py-2 pr-2 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <div className="w-12 h-1.5 bg-black/30 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-green-400"
                          style={{ width: `${rec.confidence}%` }}
                        ></div>
                      </div>
                      <span className="text-cyan-300 text-[10px]">{rec.confidence}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
