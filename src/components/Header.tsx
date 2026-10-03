import React from 'react';
import { ShieldCheck, Globe, BookOpen, Activity, Cpu, ExternalLink } from 'lucide-react';
import { SimulationState } from '../types/physics';

interface HeaderProps {
  activeTab: 'workstation' | 'validation' | 'paper' | 'cloudflare';
  setActiveTab: (tab: 'workstation' | 'validation' | 'paper' | 'cloudflare') => void;
  simState: SimulationState;
  onOpenCloudflare: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  simState,
  onOpenCloudflare,
}) => {
  return (
    <header className="border-b border-zinc-800 bg-[#0d1017]/90 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Title & Author Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 to-emerald-600 flex items-center justify-center font-bold text-white shadow-lg shadow-cyan-900/30 border border-cyan-400/30">
            Ω₆
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-zinc-100 tracking-tight">
                Phase-Synchronized Omnibus v6.0
              </h1>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800 font-mono">
                5.0PN Contact
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span>Arya Arunachala Ananda Ghulam-e-Shah-e-Unmani</span>
              <span>•</span>
              <span className="text-zinc-500">BhutaDamaraSena R&D Labs</span>
              <span>•</span>
              <a
                href="https://doi.org/10.5281/zenodo.23057494"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:text-amber-300 underline flex items-center gap-1 font-mono text-[11px]"
              >
                DOI: 10.5281/zenodo.23057494
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Live Physics Badges */}
        <div className="hidden lg:flex items-center gap-2 font-mono text-xs">
          <div className="px-2.5 py-1 rounded bg-zinc-900/90 border border-zinc-700/60 flex items-center gap-2">
            <span className="text-zinc-400">|ΔE/E₀|:</span>
            <span className="text-emerald-400 font-semibold">
              {simState.energyError < 1e-11 ? '< 1.00e-12' : simState.energyError.toExponential(2)}
            </span>
          </div>

          <div className="px-2.5 py-1 rounded bg-zinc-900/90 border border-zinc-700/60 flex items-center gap-1.5">
            <span className="text-zinc-400">CFL Limit:</span>
            <span className={simState.cflValid ? 'text-cyan-400 font-medium' : 'text-rose-400 font-bold'}>
              {simState.cflRatio.toFixed(3)} ≤ 1.571
            </span>
          </div>

          <button
            onClick={onOpenCloudflare}
            className="px-2.5 py-1 rounded bg-amber-950/40 hover:bg-amber-900/50 border border-amber-600/40 text-amber-300 flex items-center gap-1.5 transition cursor-pointer"
            title="Configure Cloudflare Subdomain: pnautomata.bhutadamarasena.com"
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>pnautomata.bhutadamarasena.com</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab('workstation')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition ${
              activeTab === 'workstation'
                ? 'bg-cyan-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Workstation</span>
          </button>

          <button
            onClick={() => setActiveTab('validation')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition ${
              activeTab === 'validation'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Validation Suite</span>
          </button>

          <button
            onClick={() => setActiveTab('paper')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition ${
              activeTab === 'paper'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>LaTeX Monograph</span>
          </button>

          <button
            onClick={() => setActiveTab('cloudflare')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition ${
              activeTab === 'cloudflare'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Cloudflare Subdomain</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
