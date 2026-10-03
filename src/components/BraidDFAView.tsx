import React from 'react';
import { AutomatonInfo, AutomatonState } from '../types/physics';
import { MathView } from './MathView';
import { GitCommit, Activity, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';

interface BraidDFAViewProps {
  automaton: AutomatonInfo;
}

export const BraidDFAView: React.FC<BraidDFAViewProps> = ({ automaton }) => {
  const states: { id: AutomatonState; label: string; code: string; color: string; desc: string }[] = [
    { id: 'S0', label: 'Hierarchical Orbit', code: 'S_0', color: '#38bdf8', desc: 'H_ratio ≥ 8.0' },
    { id: 'S1', label: 'Resonant Chaos / Chirp', code: 'S_1', color: '#f59e0b', desc: 'Relativistic coupling' },
    { id: 'S2', label: 'Topological Exchange', code: 'S_2', color: '#a855f7', desc: 'B_N braid swap' },
    { id: 'S3', label: 'Flyby / Scatter', code: 'S_3', color: '#10b981', desc: 'Asymptotic separation' },
    { id: 'S4', label: 'EOB / QNM Plunge Sink', code: 'S_4', color: '#ef4444', desc: 'r ≤ r_ISCO (6M)' },
  ];

  return (
    <div className="bg-[#0b0e14] border border-zinc-800 rounded-xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <GitCommit className="w-5 h-5 text-purple-400" />
          <h3 className="text-sm font-semibold text-zinc-100">
            Topological Braid DFA & Effective One-Body Plunge (<MathView math="B_N\text{-DFA}_{\mathrm{EOB}}^{5.0\mathrm{PN}}" />)
          </h3>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-zinc-400">Total Winding ⟨𝒲_ij⟩:</span>
          <span className="text-cyan-400 font-bold">{automaton.totalWinding.toFixed(2)} rad/2π</span>
        </div>
      </div>

      {/* 5-State Interactive DFA Automaton Diagram */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
        {states.map((st) => {
          const isActive = automaton.state === st.id;
          return (
            <div
              key={st.id}
              className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                isActive
                  ? 'border-2 shadow-lg shadow-cyan-950/50 scale-[1.02]'
                  : 'border-zinc-800/80 bg-zinc-950/40 opacity-70'
              }`}
              style={{
                borderColor: isActive ? st.color : undefined,
                backgroundColor: isActive ? `${st.color}15` : undefined,
              }}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="px-2 py-0.5 rounded text-xs font-mono font-bold"
                  style={{
                    backgroundColor: `${st.color}30`,
                    color: st.color,
                  }}
                >
                  {st.code}
                </span>
                {isActive && (
                  <span className="w-2.5 h-2.5 rounded-full animate-ping" style={{ backgroundColor: st.color }} />
                )}
              </div>
              <div className="text-xs font-medium text-zinc-200 line-clamp-1">{st.label}</div>
              <div className="text-[11px] font-mono text-zinc-400 mt-1">{st.desc}</div>
            </div>
          );
        })}
      </div>

      {/* Braid Word Stream & Non-Zeno Hysteresis Gauge */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Artin Braid Group Stream */}
        <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80">
          <div className="flex items-center justify-between text-xs text-zinc-300 font-medium mb-2">
            <span>Artin Braid Group Word <MathView math="w_{\mathbf{n}} \in B_N" />:</span>
            <span className="text-[11px] text-zinc-500 font-mono">Observer Projection n ∈ S²</span>
          </div>

          <div className="h-16 flex items-center gap-1.5 overflow-x-auto p-2 bg-[#080a0f] rounded border border-zinc-800/60 font-mono text-xs">
            {automaton.braidWord.length === 0 ? (
              <span className="text-zinc-600 italic">No braid crossings yet. Orbiting...</span>
            ) : (
              automaton.braidWord.map((gen, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 rounded bg-purple-950/60 border border-purple-800 text-purple-300 font-bold shrink-0 animate-fade-in"
                >
                  {gen}
                </span>
              ))
            )}
          </div>
        </div>

        {/* Non-Zeno Hysteresis Gap Gauge */}
        <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/80 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-300 font-medium">
            <span>Non-Zeno Hierarchy Gap <MathView math="\mathcal{H}_{\mathrm{ratio}}" />:</span>
            <span className="font-mono text-cyan-400 font-bold">{automaton.hierarchyRatio.toFixed(2)}</span>
          </div>

          <div className="space-y-1.5 my-2">
            <div className="relative w-full h-3 bg-zinc-900 rounded-full overflow-hidden border border-zinc-700/60">
              {/* Lower boundary 2.5 */}
              <div
                className="absolute top-0 bottom-0 left-[25%] w-0.5 bg-amber-400 z-10"
                title="Lower Threshold (2.5)"
              />
              {/* Upper boundary 8.0 */}
              <div
                className="absolute top-0 bottom-0 left-[80%] w-0.5 bg-emerald-400 z-10"
                title="Upper Threshold (8.0)"
              />
              {/* Current indicator */}
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-purple-500 to-emerald-500 transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.max(5, (automaton.hierarchyRatio / 10) * 100))}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-zinc-500">
              <span>0.0 (Singular)</span>
              <span className="text-amber-400">2.5 (Chaos S₁)</span>
              <span className="text-emerald-400">8.0 (Hierarchical S₀)</span>
              <span>10.0+</span>
            </div>
          </div>

          <div className="text-[11px] text-zinc-400 leading-tight">
            Theorem 4.2 guarantees the transition function is total and strictly immune to Zeno chattering across the gap.
          </div>
        </div>
      </div>

      {/* EOB Plunge / QNM Ringdown Status Banner if S4 is reached */}
      {automaton.isISCOCrossed && (
        <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-600/50 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
            <div>
              <div className="font-semibold text-rose-300">
                Effective One-Body (EOB) Resummed Potential Active (<MathView math="A_{\mathrm{EOB}}(u) = P_5^1[\dots]" />)
              </div>
              <div className="text-zinc-300 text-[11px]">
                Classical Taylor expansion truncated at ISCO (<MathView math="r \le 6M" />). Seamless physical continuation into Kerr Quasi-Normal Mode (QNM) ringdown (<MathView math="\omega_{\mathrm{QNM}} = 0.58/M, \tau = 12M" />).
              </div>
            </div>
          </div>
          <div className="px-3 py-1 rounded bg-rose-900/60 border border-rose-500 text-rose-200 font-mono text-xs shrink-0 font-bold">
            QNM RINGDOWN
          </div>
        </div>
      )}
    </div>
  );
};
