import React, { useEffect, useRef, useState } from 'react';
import { Agent, SimulationState, Vector3D } from '../types/physics';
import { ZoomIn, ZoomOut, RotateCcw, Eye, Layers } from 'lucide-react';

interface SimulationCanvasProps {
  agents: Agent[];
  simState: SimulationState;
  showTrails: boolean;
  showVectors: boolean;
  showBarycenter: boolean;
  showSoftMinEquipotentials: boolean;
}

export const SimulationCanvas: React.FC<SimulationCanvasProps> = ({
  agents,
  simState,
  showTrails = true,
  showVectors = true,
  showBarycenter = true,
  showSoftMinEquipotentials = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState<number>(20); // pixels per coordinate unit
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Handle Pan and Zoom interactions
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.15 : 0.85;
    setZoom((prev) => Math.max(5, Math.min(80, prev * factor)));
  };

  const resetView = () => {
    setZoom(20);
    setPan({ x: 0, y: 0 });
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI crisp rendering
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

    const centerX = width / 2 + pan.x;
    const centerY = height / 2 + pan.y;

    // 1. Draw subtle coordinate grid
    ctx.strokeStyle = '#161b26';
    ctx.lineWidth = 1;
    const gridSize = zoom * 5;
    const offsetX = centerX % gridSize;
    const offsetY = centerY % gridSize;

    ctx.beginPath();
    for (let x = offsetX; x < width; x += gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }
    for (let y = offsetY; y < height; y += gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }
    ctx.stroke();

    // 2. Draw Soft-Minimum Equipotential Contours if enabled
    if (showSoftMinEquipotentials && agents.length >= 2) {
      ctx.save();
      const rMinVal = simState.softMinR;
      // Draw circular soft-min repulsion field around primary pair
      const p0 = agents[0].position;
      const scrX0 = centerX + p0.x * zoom;
      const scrY0 = centerY - p0.y * zoom;

      const gradient = ctx.createRadialGradient(scrX0, scrY0, 2, scrX0, scrY0, Math.max(10, rMinVal * zoom));
      gradient.addColorStop(0, 'rgba(14, 116, 144, 0.12)');
      gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.05)');
      gradient.addColorStop(1, 'rgba(14, 116, 144, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(scrX0, scrY0, Math.max(10, rMinVal * zoom), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Draw ISCO (Innermost Stable Circular Orbit: r = 6M) indicator circle
    const iscoRadiusPx = 6.0 * zoom;
    ctx.save();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, iscoRadiusPx, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
    ctx.font = '10px Fira Code';
    ctx.fillText('ISCO (r = 6M)', centerX + iscoRadiusPx + 6, centerY + 4);
    ctx.restore();

    // 4. Draw Karcher Barycenter q_0 & Geodesics
    if (showBarycenter) {
      const q0 = simState.karcherBarycenter;
      const q0x = centerX + q0.x * zoom;
      const q0y = centerY - q0.y * zoom;

      // Geodesic dashed lines to each agent
      ctx.save();
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);

      for (const a of agents) {
        const ax = centerX + a.position.x * zoom;
        const ay = centerY - a.position.y * zoom;
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(q0x, q0y);
        ctx.stroke();
      }

      // Barycenter crosshair marker
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(q0x, q0y, 5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(q0x - 8, q0y);
      ctx.lineTo(q0x + 8, q0y);
      ctx.moveTo(q0x, q0y - 8);
      ctx.lineTo(q0x, q0y + 8);
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = '10px Inter';
      ctx.fillText('q₀ (Karcher)', q0x + 8, q0y - 6);
      ctx.restore();
    }

    // 5. Draw Agent Orbital Trails
    if (showTrails) {
      for (const a of agents) {
        if (!a.trail || a.trail.length < 2) continue;

        ctx.save();
        ctx.lineWidth = 2.0;

        for (let i = 1; i < a.trail.length; i++) {
          const ptPrev = a.trail[i - 1];
          const ptCurr = a.trail[i];
          const alpha = (i / a.trail.length) * 0.8;

          ctx.strokeStyle = a.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.moveTo(centerX + ptPrev.x * zoom, centerY - ptPrev.y * zoom);
          ctx.lineTo(centerX + ptCurr.x * zoom, centerY - ptCurr.y * zoom);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // 6. Draw Agents and Vector Overlays
    for (const a of agents) {
      const scrX = centerX + a.position.x * zoom;
      const scrY = centerY - a.position.y * zoom;
      const radius = Math.max(5, Math.min(14, a.mass * 6));

      // Glow halo
      ctx.save();
      const haloGradient = ctx.createRadialGradient(scrX, scrY, radius * 0.5, scrX, scrY, radius * 2.2);
      haloGradient.addColorStop(0, a.color);
      haloGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = haloGradient;
      ctx.beginPath();
      ctx.arc(scrX, scrY, radius * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Solid agent core
      ctx.fillStyle = a.color;
      ctx.beginPath();
      ctx.arc(scrX, scrY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Border ring
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Phase indicator tick on agent circle (Synthetic Phase \Phi_i \in S^1)
      const phaseX = scrX + Math.cos(a.phase) * (radius + 4);
      const phaseY = scrY - Math.sin(a.phase) * (radius + 4);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(scrX, scrY);
      ctx.lineTo(phaseX, phaseY);
      ctx.stroke();

      // Agent label
      ctx.fillStyle = '#e2e8f0';
      ctx.font = '11px Inter';
      ctx.fillText(a.name, scrX + radius + 5, scrY - 5);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px Fira Code';
      ctx.fillText(`m=${a.mass.toFixed(1)} Φ=${(a.phase % (2 * Math.PI)).toFixed(2)}`, scrX + radius + 5, scrY + 9);

      // Velocity Vector Arrow
      if (showVectors) {
        const vxPx = a.velocity.x * zoom * 1.5;
        const vyPx = -a.velocity.y * zoom * 1.5;
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(scrX, scrY);
        ctx.lineTo(scrX + vxPx, scrY + vyPx);
        ctx.stroke();

        // Spin Vector Arrow (S_i precessing on SO(3))
        const sxPx = a.spin.x * zoom * 2.0;
        const syPx = -a.spin.y * zoom * 2.0;
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(scrX, scrY);
        ctx.lineTo(scrX + sxPx, scrY + syPx);
        ctx.stroke();
      }

      ctx.restore();
    }

    ctx.restore();
  }, [agents, simState, zoom, pan, showTrails, showVectors, showBarycenter, showSoftMinEquipotentials]);

  return (
    <div className="relative w-full h-full min-h-[460px] bg-[#07090e] rounded-xl overflow-hidden border border-zinc-800 flex flex-col">
      {/* Top Overlay Bar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <div className="px-3 py-1.5 rounded-lg bg-zinc-900/90 backdrop-blur border border-zinc-700/60 shadow-lg text-xs font-mono flex items-center gap-2 text-zinc-300">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>t = {simState.time.toFixed(2)} M</span>
          <span className="text-zinc-600">|</span>
          <span>Δτ = {simState.dt.toFixed(3)}</span>
          <span className="text-zinc-600">|</span>
          <span className="text-cyan-400">R_min = {simState.softMinR.toFixed(2)}</span>
        </div>

        {simState.automaton.isISCOCrossed && (
          <div className="px-2.5 py-1.5 rounded-lg bg-rose-950/80 border border-rose-600/70 text-rose-300 text-xs font-mono animate-bounce flex items-center gap-1.5 shadow-lg shadow-rose-950/40">
            <span>⚡ ISCO CROSSED (EOB Plunge Active)</span>
          </div>
        )}
      </div>

      {/* Canvas View Controls */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 bg-zinc-900/90 backdrop-blur p-1 rounded-lg border border-zinc-800 shadow-lg text-zinc-400">
        <button
          onClick={() => setZoom((z) => Math.min(80, z * 1.2))}
          className="p-1.5 hover:bg-zinc-800 hover:text-white rounded transition"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(5, z / 1.2))}
          className="p-1.5 hover:bg-zinc-800 hover:text-white rounded transition"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-1.5 hover:bg-zinc-800 hover:text-white rounded transition"
          title="Reset Viewport"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Main Canvas Element */}
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className="w-full h-full flex-1 cursor-grab active:cursor-grabbing"
      />

      {/* Legend Footer */}
      <div className="absolute bottom-2 left-3 right-3 z-10 flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-400 pointer-events-none">
        <div className="flex items-center gap-3 bg-zinc-950/80 px-2.5 py-1 rounded border border-zinc-800/80 backdrop-blur">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-emerald-400" /> Velocity (v)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-rose-400 border-dashed" /> SO(3) Spin (S)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full border border-sky-400" /> Karcher Pole (q₀)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border-t border-rose-500/50 border-dashed" /> ISCO Boundary
          </span>
        </div>
        <div className="text-zinc-500 hidden sm:block">
          Scroll to zoom • Drag to pan viewport
        </div>
      </div>
    </div>
  );
};
