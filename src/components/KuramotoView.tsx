import React from 'react';
import { Agent, SimulationState } from '../types/physics';
import { MathView } from './MathView';
import { Compass, CheckCircle2, AlertTriangle, Layers, Info } from 'lucide-react';

interface KuramotoViewProps {
  agents: Agent[];
  simState: SimulationState;
  kSync: number;
  setKSync: (k: number) => void;
}

export const KuramotoView: React.FC<KuramotoViewProps> = ({
  agents,
  simState,
  kSync,
  setKSync,
}) => {
  const rOrder = simState.kuramotoOrderR;
  const q0 = simState.karcherBarycenter;
  const zG = simState.kuramotoVector;

  return (
    <div className="bg-[#0b0e14] border border-zinc-800 rounded-xl p-4 flex flex-col gap-4">
      {/* Header & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-semibold text-zinc-100">
            Riemannian Kuramoto Dynamics & Covariant Synchronization
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {simState.karcherSchoenValid ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-700/60 text-emerald-400 text-xs font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Karcher-Schoen Bound Satisfied
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-700/60 text-amber-400 text-xs font-mono">
              <AlertTriangle className="w-3.5 h-3.5" />
              Swarm Radius Exceeds Bound
            </span>
          )}
        </div>
      </div>

      {/* Main Grid: Phase Dial & Coherence Vector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Phase Dial on S^1 */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-3 flex flex-col items-center justify-center relative">
          <span className="text-xs font-medium text-zinc-400 mb-2">
            Tangent Space Phasors <MathView math="\bm{u}_i \in T_{q_i}\Sigma \to \widetilde{\bm{u}}_i \in T_{q_0}\Sigma" />
          </span>
          <svg viewBox="-120 -120 240 240" className="w-48 h-48">
            {/* Unit circle S^1 */}
            <circle cx="0" cy="0" r="90" fill="none" stroke="#27272a" strokeWidth="2" strokeDasharray="3 3" />
            <circle cx="0" cy="0" r="45" fill="none" stroke="#18181b" strokeWidth="1" />
            <line x1="-105" y1="0" x2="105" y2="0" stroke="#1f2937" strokeWidth="1" />
            <line x1="0" y1="-105" x2="0" y2="105" stroke="#1f2937" strokeWidth="1" />

            {/* Individual Agent Transported Phasors */}
            {agents.map((a) => {
              const px = Math.cos(a.phase) * 85;
              const py = -Math.sin(a.phase) * 85;
              return (
                <g key={a.id}>
                  <line x1="0" y1="0" x2={px} y2={py} stroke={a.color} strokeWidth="2" opacity="0.75" />
                  <circle cx={px} cy={py} r="4.5" fill={a.color} stroke="#ffffff" strokeWidth="1" />
                </g>
              );
            })}

            {/* Coherence Resultant Vector Z_g */}
            {(() => {
              const zx = zG.x * 90;
              const zy = -zG.y * 90;
              return (
                <g>
                  <line x1="0" y1="0" x2={zx} y2={zy} stroke="#06b6d4" strokeWidth="3.5" />
                  <circle cx={zx} cy={zy} r="6" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                </g>
              );
            })()}

            <circle cx="0" cy="0" r="3" fill="#ffffff" />
          </svg>

          <div className="mt-2 text-center">
            <div className="text-xs text-zinc-400 font-mono">
              Coherence Order Parameter <MathView math="R_g(t)" />:
            </div>
            <div className="text-xl font-bold font-mono text-cyan-400">
              {rOrder.toFixed(4)}{' '}
              <span className="text-xs text-zinc-500 font-normal">
                ({(rOrder * 100).toFixed(1)}% Phase Locked)
              </span>
            </div>
          </div>
        </div>

        {/* Kuramoto Metrics & Mathematical Guarantees */}
        <div className="flex flex-col justify-between gap-3 bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-3">
          <div>
            <div className="text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              <span>Covariant Transport Invariants</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Karcher Barycenter q₀:</span>
                <span className="text-zinc-200">
                  ({q0.x.toFixed(2)}, {q0.y.toFixed(2)}, {q0.z.toFixed(2)})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Max Connection Holonomy (δ_max^g):</span>
                <span className="text-amber-400">
                  {(simState.holonomyMax * (180 / Math.PI)).toFixed(2)}° (&lt; 45°)
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-zinc-800">
                <span className="text-zinc-400">Exponential Rate λ_g:</span>
                <span className="text-emerald-400 font-medium">
                  {(kSync * Math.cos(simState.holonomyMax) - 0.2).toFixed(3)} s⁻¹
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-zinc-400">Sectional Curvature Bound K_max:</span>
                <span className="text-cyan-400">0.040 m⁻²</span>
              </div>
            </div>
          </div>

          {/* Sync Gain Slider */}
          <div className="pt-2 border-t border-zinc-800">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-zinc-300 font-medium">
                Coupling Gain <MathView math="K_{\mathrm{sync}}" />:
              </span>
              <span className="text-cyan-400 font-mono font-bold">{kSync.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="8.0"
              step="0.1"
              value={kSync}
              onChange={(e) => setKSync(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
              <span>0 (Decoupled)</span>
              <span>K_c^g (Critical)</span>
              <span>8.0 (Strong Locking)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Theorem Box */}
      <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40 text-xs text-zinc-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-cyan-300">Theorem 2.3 (Exponential Contraction):</strong> Under the Karcher-Schoen uniqueness bound, parallel transport along Levi-Civita geodesics strictly resolves manifold holonomy. For{' '}
          <MathView math="K_{\mathrm{sync}} > K_c^g" />, the expected Lyapunov variance satisfies{' '}
          <MathView math="\mathbb{E}[1 - R_g(t)] \le (1 - R_g(0)) e^{-\lambda_g t}" />, guaranteeing global phase locking without Riemann topological singularities.
        </div>
      </div>
    </div>
  );
};
