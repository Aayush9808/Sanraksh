"use client";
import { useEffect, useRef } from "react";

interface Particle {
  x: number; y: number; vx: number; vy: number;
  size: number; opacity: number; hue: number;
}

export default function AmbientCanvas({ intensity = 0.5 }: { intensity?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let particles: Particle[] = [];
    const count = Math.floor(40 * intensity);

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.3 + 0.05,
        hue: Math.random() > 0.5 ? 38 : 260, // amber or violet
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Ambient gradient blobs
      const t = Date.now() * 0.0003;
      const cx1 = canvas.width * 0.3 + Math.sin(t) * 100;
      const cy1 = canvas.height * 0.4 + Math.cos(t * 0.7) * 80;
      const grad1 = ctx.createRadialGradient(cx1, cy1, 0, cx1, cy1, 400);
      grad1.addColorStop(0, "rgba(245, 158, 11, 0.04)");
      grad1.addColorStop(1, "rgba(245, 158, 11, 0)");
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cx2 = canvas.width * 0.7 + Math.cos(t * 0.8) * 120;
      const cy2 = canvas.height * 0.6 + Math.sin(t * 0.5) * 100;
      const grad2 = ctx.createRadialGradient(cx2, cy2, 0, cx2, cy2, 350);
      grad2.addColorStop(0, "rgba(139, 92, 246, 0.03)");
      grad2.addColorStop(1, "rgba(139, 92, 246, 0)");
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 65%, ${p.opacity})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [intensity]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  );
}
