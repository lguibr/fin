import React, { useEffect, useRef } from 'react';

interface LightParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  opacity: number;
  size: number;
}

interface BlurBlob {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  opacity: number;
}

const ParticleBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lightParticlesRef = useRef<LightParticle[]>([]);
  const blurBlobsRef = useRef<BlurBlob[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Grid settings
    const gridSize = 60;
    
    // Light particle colors
    const lightColors = [
      'rgba(56, 189, 248, 0.8)',   // sky blue
      'rgba(139, 92, 246, 0.8)',   // purple
      'rgba(251, 191, 36, 0.8)',   // gold
      'rgba(34, 211, 238, 0.8)',   // cyan
    ];

    // Initialize light particles traveling along grid lines
    const initLightParticles = () => {
      lightParticlesRef.current = [];
      const numParticles = 5;
      
      for (let i = 0; i < numParticles; i++) {
        const isHorizontal = Math.random() > 0.5;
        const color = lightColors[Math.floor(Math.random() * lightColors.length)];
        
        if (isHorizontal) {
          // Horizontal movement
          const gridRow = Math.floor(Math.random() * (canvas.height / gridSize)) * gridSize;
          lightParticlesRef.current.push({
            x: Math.random() * canvas.width,
            y: gridRow,
            vx: (Math.random() > 0.5 ? 1 : -1) * (12 + Math.random() * 8),
            vy: 0,
            color,
            opacity: 0.8 + Math.random() * 0.2,
            size: 0.2 + Math.random() * 0.3,
          });
        } else {
          // Vertical movement
          const gridCol = Math.floor(Math.random() * (canvas.width / gridSize)) * gridSize;
          lightParticlesRef.current.push({
            x: gridCol,
            y: Math.random() * canvas.height,
            vx: 0,
            vy: (Math.random() > 0.5 ? 1 : -1) * (12 + Math.random() * 8),
            color,
            opacity: 0.8 + Math.random() * 0.2,
            size: 0.2 + Math.random() * 0.3,
          });
        }
      }
    };

    // Initialize blur blobs
    const initBlurBlobs = () => {
      blurBlobsRef.current = [];
      const blobColors = [
        'rgba(59, 130, 246, 0.15)',   // blue
        'rgba(139, 92, 246, 0.15)',   // purple
        'rgba(236, 72, 153, 0.15)',   // pink
        'rgba(251, 191, 36, 0.15)',   // amber
        'rgba(34, 211, 238, 0.15)',   // cyan
      ];
      
      for (let i = 0; i < 5; i++) {
        blurBlobsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: 100 + Math.random() * 200,
          color: blobColors[i % blobColors.length],
          opacity: 0.3 + Math.random() * 0.3,
        });
      }
    };

    initLightParticles();
    initBlurBlobs();

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw blur blobs
      blurBlobsRef.current.forEach((blob) => {
        // Update position
        blob.x += blob.vx;
        blob.y += blob.vy;

        // Bounce off edges
        if (blob.x < -blob.radius || blob.x > canvas.width + blob.radius) blob.vx *= -1;
        if (blob.y < -blob.radius || blob.y > canvas.height + blob.radius) blob.vy *= -1;

        // Draw blob with heavy blur
        ctx.save();
        ctx.filter = 'blur(60px)';
        ctx.globalAlpha = blob.opacity;
        ctx.beginPath();
        ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
        ctx.fillStyle = blob.color;
        ctx.fill();
        ctx.restore();
      });

      // Draw grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;

      // Vertical lines
      for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Horizontal lines
      for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw and update light particles
      lightParticlesRef.current.forEach((particle) => {
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Wrap around edges
        if (particle.vx !== 0) {
          // Horizontal movement
          if (particle.x < -20) particle.x = canvas.width + 20;
          if (particle.x > canvas.width + 20) particle.x = -20;
        } else {
          // Vertical movement
          if (particle.y < -20) particle.y = canvas.height + 20;
          if (particle.y > canvas.height + 20) particle.y = -20;
        }

        // Draw particle with glow
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = particle.color;
        ctx.globalAlpha = particle.opacity;

        // Draw outer glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, particle.size * 4
        );
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        // Draw core
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = particle.color;
        ctx.fill();

        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full -z-10"
      style={{ background: 'hsl(var(--background))' }}
    />
  );
};

export default ParticleBackground;
