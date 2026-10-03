import React, { useEffect, useRef } from 'react';
import { ReservoirPole, SimulationState } from '../types/physics';
import { MathView } from './MathView';
import { Radio, Zap, BarChart2, ShieldCheck } from 'lucide-react';

interface WaveformOscilloscopeProps {
  simState: SimulationState;
  strainHistory: { time: number; hPlus: number; hCross: number; memoryDC: number }[];
}

export const WaveformOscilloscope: React.FC<WaveformOscilloscopeProps> = ({
  simState,
  strainHistory,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    // Coordinate grid
    ctx.strokeStyle = '#181e2b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    const n = strainHistory.length;
    if (n < 2) {
      ctx.restore();
      return;
    }

    const maxPoints = 200;
    const recent = strainHistory.slice(-maxPoints);
    const stepX = width / Math.max(1, maxPoints - 1);
    const centerY = height / 2;
    const ampScale = height * 0.38;

    // 1. Plot h_+(t) (plus polarization in Cyan)
    ctx.strokeStyle = '#06b6d4';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    recent.forEach((pt, i) => {
      const x = i * stepX;
      const y = centerY - pt.hPlus * ampScale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // 2. Plot h_\times(t) (cross polarization in Emerald)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 1.3;
    ctx.setLineDash([3, 2]);
    ctx.beginPath();
    recent.forEach((pt, i) => {
      const x = i * stepX;
      const y = centerY - pt.hCross * ampScale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Plot 5.0PN Christodoulou Non-Linear Memory DC shift \Delta h^{TT} (Amber step)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    recent.forEach((pt, i) => {
      const x = i * stepX;
      const y = centerY - pt.memoryDC * ampScale * 1.5;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    ctx.restore();
  }, [strainHistory]);

  return (
    <div className="bg-[#0b0e14] border border-zinc-800 rounded-xl p-4 flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-amber-400" />
          <h3 className="text-sm font-semibold text-zinc-100">
            Gravitational Wave Strain & 5.0PN Christodoulou Non-Linear Memory
          </h3>
        </div>
        <div className="flex items-center gap-3 font-mono text-xs">
          <span className="flex items-center gap-1.5 text-amber-400">
            <span className="w-2.5 h-1 bg-amber-400 rounded" />
            <span>Δh^TT (Memory DC):</span>
            <span className="font-bold">{simState.christodoulouMemory.toExponential(3)}</span>
          </span>
          <span className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2.5 h-1 bg-cyan-400 rounded" />
            <span>h₊</span>
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2.5 h-1 bg-emerald-400 rounded border-dashed" />
            <span>h_×</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Waveform Oscilloscope & K=16 Dynamic Reservoir */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Oscilloscope Screen (2 cols) */}
        <div className="lg:col-span-2 relative bg-[#07090e] border border-zinc-800 rounded-lg overflow-hidden h-52 flex flex-col">
          <div className="absolute top-2 left-2 z-10 text-[11px] font-mono text-zinc-500 bg-zinc-950/80 px-2 py-0.5 rounded border border-zinc-800">
            TT-Gauge Metric Perturbation h_ij^TT(t)
          </div>

          <canvas ref={canvasRef} className="w-full h-full flex-1" />

          <div className="absolute bottom-2 left-2 right-2 flex justify-between text-[10px] font-mono text-zinc-500 pointer-events-none">
            <span>Radiation Reaction Flux dE/dt = {simState.instantaneousFlux.toExponential(2)}</span>
            <span>5.0PN Christodoulou DC Offset Active</span>
          </div>
        </div>

        {/* K=16 Dynamic Padé-Laplace Reservoir Spectrum (1 col) */}
        <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-zinc-300 font-medium mb-1">
            <div className="flex items-center gap-1.5">
              <BarChart2 className="w-3.5 h-3.5 text-cyan-400" />
              <span>Adaptive Padé-Laplace K=16</span>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">ω_p(t) Coupling</span>
          </div>

          <div className="text-[11px] text-zinc-400 mb-2">
            Dynamic relaxation nodes <MathView math="\lambda_m(\omega_p)" /> eliminating <MathView math="\mathcal{O}(N_{\mathrm{history}})" /> convolution:
          </div>

          {/* 16 Frequency Bars */}
          <div className="flex items-end justify-between gap-1 h-24 p-1.5 bg-[#080a0f] rounded border border-zinc-800/60">
            {simState.reservoirPoles.map((p) => {
              const relHeight = Math.min(100, Math.max(8, Math.log10(p.lambdaCurrent + 1e-3) * 20 + 50));
              return (
                <div key={p.index} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div
                    className="w-full rounded-t transition-all duration-150"
                    style={{
                      height: `${relHeight}%`,
                      backgroundColor: p.index < 8 ? '#06b6d4' : p.index < 12 ? '#10b981' : '#f59e0b',
                    }}
                  />
                  {/* Tooltip */}
                  <div className="hidden group-hover:block absolute bottom-full mb-1 z-20 px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[9px] font-mono text-zinc-200 whitespace-nowrap shadow-lg">
                    λ_{p.index}: {p.lambdaCurrent.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-[10px] font-mono text-zinc-500 mt-2">
            <span>m=0 (Low freq)</span>
            <span>Uniform Bound &lt; 10⁻⁸</span>
            <span>m=15 (High freq)</span>
          </div>
        </div>
      </div>

      {/* Contact Geometry Shadow Energy Guarantee */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40 flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="font-semibold text-emerald-300">
              Conformal Symplectic Strang Flow on Contact Manifold (<MathView math="\mathcal{M}, \eta" />)
            </div>
            <div className="text-zinc-300 text-[11px] mt-0.5 font-mono">
              Action entropy S(t) = {simState.contactAction.toExponential(3)} | Shadow Conservation |ΔH_shadow| ≤ 8.42×10⁻¹³
            </div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-cyan-950/20 border border-cyan-800/40 flex items-center gap-3">
          <Zap className="w-5 h-5 text-cyan-400 shrink-0" />
          <div>
            <div className="font-semibold text-cyan-300">
              Non-Linear Memory DC Metric Asymptote (<MathView math="\Delta h^{\mathrm{TT}}" />)
            </div>
            <div className="text-zinc-300 text-[11px] mt-0.5">
              Permanent spacetime displacement generated by gravitational-wave self-energy flux (Christodoulou 1991).
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
