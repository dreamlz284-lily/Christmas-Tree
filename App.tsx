import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Particle, ParticleType } from './types';

// --- Constants ---
const TREE_PARTICLE_COUNT = 45000; 
const SPIRAL_PARTICLE_COUNT = 5000; 
const ORNAMENT_COUNT = 600; 
const SNOW_PARTICLE_COUNT = 1500;
const TREE_HEIGHT_RATIO = 0.75; 
const TREE_BASE_WIDTH_RATIO = 0.45;
const TREE_BASE_WIDTH_RATIO_MOBILE = 0.85;
const ROTATION_SPEED = 0.003; 
const BLINK_SPEED = 0.05;
const DRAG_SENSITIVITY = 0.005;
const ZOOM_SENSITIVITY = 0.001;

const GREETINGS = [
  "Wishing you a joyful Christmas and a New Year filled with good health and success.",
  "Warmest wishes to you and your family for a peaceful and wonderful Christmas season.",
  "May this Christmas bring you moments of rest, joy, and time well spent with loved ones.",
  "Best wishes for a happy holiday season and a prosperous New Year ahead.",
  "Wishing you a relaxing Christmas and continued success in the year to come.",
  "Season’s greetings, and thank you for your support and collaboration throughout the year.",
  "May the holiday season bring you happiness, good health, and renewed energy for the New Year.",
  "Warm wishes for a joyful Christmas and a bright, fulfilling New Year.",
  "Wishing you peace, happiness, and all the best this holiday season.",
  "It has been a pleasure working with you this year. Wishing you a wonderful Christmas and New Year.",
  "May your Christmas be filled with warmth and your New Year with new opportunities.",
  "Best regards for the holiday season, and sincere wishes for a successful year ahead."
];

const random = (min: number, max: number) => Math.random() * (max - min) + min;

const App: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [fade, setFade] = useState(true);

  const particles = useRef<Particle[]>([]);
  const frameId = useRef<number>(0);
  const startTime = useRef<number | null>(null);
  
  const rotation = useRef({ x: 0, y: 0 }); 
  const zoom = useRef(1.0);
  
  const isDragging = useRef(false);
  const lastMouse = useRef({ x: 0, y: 0 });

  const initParticles = useCallback((width: number, height: number) => {
    const newParticles: Particle[] = [];
    const isMobile = width < 768; 
    const treeHeight = height * TREE_HEIGHT_RATIO;
    const currentBaseWidthRatio = isMobile ? TREE_BASE_WIDTH_RATIO_MOBILE : TREE_BASE_WIDTH_RATIO;
    const treeBaseWidth = width * currentBaseWidthRatio;

    for (let i = 0; i < TREE_PARTICLE_COUNT; i++) {
      const y = random(-treeHeight / 2, treeHeight / 2);
      const progress = (y + treeHeight / 2) / treeHeight; 
      const radiusAtHeight = (treeBaseWidth / 2) * progress;
      const angle = random(0, Math.PI * 2);
      const r = Math.sqrt(random(0, 1)) * radiusAtHeight;
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      const g = Math.floor(random(80, 220)); 
      const baseColor = { r: 20, g: g, b: 40 };
      const size = random(0.2, 1.1); 

      newParticles.push({
        x, y, z,
        ix: x, iy: y, iz: z,
        sx: random(-width * 1.5, width * 1.5),
        sy: random(-height * 1.5, height * 1.5),
        sz: random(-1000, 1000),
        vx: 0, vy: 0,
        color: `rgb(${baseColor.r},${baseColor.g},${baseColor.b})`,
        baseColor,
        life: random(0, 100),
        maxLife: 100,
        size: size,
        type: ParticleType.TREE_BODY
      });
    }

    const spiralLoops = 6;
    for (let i = 0; i < SPIRAL_PARTICLE_COUNT; i++) {
      const isSecondSpiral = i % 2 === 0;
      const t = i / SPIRAL_PARTICLE_COUNT; 
      const thickness = 0.05; 
      const progress = Math.max(0, Math.min(1, t + random(-thickness, thickness)));
      const y = -treeHeight / 2 + treeHeight * progress;
      const radiusAtHeight = (treeBaseWidth / 2) * progress;
      let angle = progress * Math.PI * 2 * spiralLoops;
      if (isSecondSpiral) angle += Math.PI; 
      const r = radiusAtHeight * random(0.95, 1.05); 
      angle += random(-0.15, 0.15);
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      const rand = Math.random();
      let baseColor = { r: 255, g: 215, b: 0 }; 
      if (rand < 0.5) baseColor = { r: 255, g: 250, b: 180 }; 
      const size = random(0.4, 0.9); 

      newParticles.push({
        x, y, z,
        ix: x, iy: y, iz: z,
        sx: random(-width * 1.5, width * 1.5),
        sy: random(-height * 1.5, height * 1.5),
        sz: random(-1000, 1000),
        vx: 0, vy: 0,
        color: `rgb(${baseColor.r},${baseColor.g},${baseColor.b})`,
        baseColor,
        life: random(0, 100),
        maxLife: 100,
        size: size,
        type: ParticleType.TREE_LIGHT
      });
    }

    for (let i = 0; i < ORNAMENT_COUNT; i++) {
      const y = random(-treeHeight / 2, treeHeight / 2);
      const progress = (y + treeHeight / 2) / treeHeight;
      const radiusAtHeight = (treeBaseWidth / 2) * progress;
      const angle = random(0, Math.PI * 2);
      const r = radiusAtHeight * random(0.65, 1.0); 
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);
      const colorType = Math.random();
      let baseColor;
      if (colorType < 0.2) baseColor = { r: 180, g: 40, b: 40 };      
      else if (colorType < 0.4) baseColor = { r: 40, g: 80, b: 180 }; 
      else if (colorType < 0.6) baseColor = { r: 180, g: 70, b: 180 };
      else if (colorType < 0.8) baseColor = { r: 180, g: 115, b: 0 };  
      else baseColor = { r: 150, g: 150, b: 150 };                     
      const size = random(0.6, 1.0); 

      newParticles.push({
        x, y, z,
        ix: x, iy: y, iz: z,
        sx: random(-width * 1.5, width * 1.5),
        sy: random(-height * 1.5, height * 1.5),
        sz: random(-1000, 1000),
        vx: 0, vy: 0,
        color: `rgb(${baseColor.r},${baseColor.g},${baseColor.b})`,
        baseColor,
        life: random(0, 100),
        maxLife: 100,
        size: size,
        type: ParticleType.TREE_LIGHT
      });
    }

    for (let i = 0; i < SNOW_PARTICLE_COUNT; i++) {
      newParticles.push({
        x: random(-width, width), 
        y: random(-height, height),
        z: random(-500, 500), 
        ix: 0, iy: 0, iz: 0,
        sx: 0, sy: 0, sz: 0,
        vx: random(-0.2, 0.2), 
        vy: random(0.5, 1.5), 
        color: 'rgba(255, 255, 255, 0.8)',
        baseColor: { r: 255, g: 255, b: 255 },
        life: 0,
        maxLife: 0,
        size: random(0.2, 0.8), 
        type: ParticleType.SNOW
      });
    }
    particles.current = newParticles;
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setGreetingIndex((prev) => (prev + 1) % GREETINGS.length);
        setFade(true);
      }, 500); 
    }, 6000); 
    return () => clearInterval(interval);
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const now = performance.now();
    if (startTime.current === null) startTime.current = now;
    const elapsed = now - startTime.current;
    const duration = 4000; 
    const progress = Math.min(1, elapsed / duration);
    const ease = 1 - Math.pow(1 - progress, 3);

    const width = canvas.width;
    const height = canvas.height;
    const fov = 800; 

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    if (!isDragging.current) {
        const speedMultiplier = 1 + (1 - ease) * 5; 
        rotation.current.y += ROTATION_SPEED * speedMultiplier;
    }
    
    const cosY = Math.cos(rotation.current.y);
    const sinY = Math.sin(rotation.current.y);
    const cosX = Math.cos(rotation.current.x);
    const sinX = Math.sin(rotation.current.x);
    const currentZoom = zoom.current;
    const pList = particles.current;
    const len = pList.length;

    for (let i = 0; i < len; i++) {
      const p = pList[i];
      if (p.type === ParticleType.TREE_BODY || p.type === ParticleType.TREE_LIGHT) {
        let tx = p.ix; let ty = p.iy; let tz = p.iz;
        if (progress < 1) {
          tx = p.sx + (p.ix - p.sx) * ease;
          ty = p.sy + (p.iy - p.sy) * ease;
          tz = p.sz + (p.iz - p.sz) * ease;
        }
        const x1 = tx * cosY - tz * sinY;
        const z1 = tx * sinY + tz * cosY;
        const y1 = ty;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;
        const x2 = x1;
        const scale = (fov / (fov + z2)) * currentZoom;
        if (scale < 0) continue;
        const x = x2 * scale + width / 2;
        const y = y2 * scale + height / 2;
        p.life += BLINK_SPEED;
        const size = p.size * scale;
        
        if (p.type === ParticleType.TREE_LIGHT) {
          const blink = Math.sin(p.life * 2 + p.ix) * 0.5 + 0.5; 
          let alpha = blink < 0.1 ? 0.1 : 0.6; 
          ctx.fillStyle = `rgba(${p.baseColor.r}, ${p.baseColor.g}, ${p.baseColor.b}, ${alpha})`;
          if (size < 1.2) ctx.fillRect(x, y, size, size);
          else { ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill(); }
        } else {
          const shimmer = Math.sin(p.life + p.iy) * 0.2 + 0.8;
          ctx.fillStyle = `rgba(${p.baseColor.r}, ${p.baseColor.g * shimmer}, ${p.baseColor.b}, 0.4)`;
          if (size < 1.5) ctx.fillRect(x, y, size, size);
          else { ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill(); }
        }
      } else if (p.type === ParticleType.SNOW) {
        p.x += p.vx; p.y += p.vy;
        if (p.y > height / 2 + 100) { p.y = -height / 2 - 100; p.x = random(-width / 1.5, width / 1.5); }
        const scale = (fov / (fov + p.z)) * currentZoom;
        const x = p.x * scale + width / 2;
        const y = p.y * scale + height / 2;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + scale * 0.4})`;
        const size = p.size * scale;
        ctx.beginPath(); ctx.arc(x, y, size, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.globalCompositeOperation = 'source-over';
    frameId.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        canvasRef.current.width = clientWidth;
        canvasRef.current.height = clientHeight;
        initParticles(clientWidth, clientHeight);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); 
    frameId.current = requestAnimationFrame(animate);
    return () => { window.removeEventListener('resize', handleResize); cancelAnimationFrame(frameId.current); };
  }, [initParticles, animate]);

  const handleStart = (clientX: number, clientY: number) => { isDragging.current = true; lastMouse.current = { x: clientX, y: clientY }; };
  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging.current) return;
    const dx = clientX - lastMouse.current.x;
    const dy = clientY - lastMouse.current.y;
    rotation.current.y += dx * DRAG_SENSITIVITY;
    rotation.current.x += dy * DRAG_SENSITIVITY;
    rotation.current.x = Math.max(-1.0, Math.min(1.0, rotation.current.x));
    lastMouse.current = { x: clientX, y: clientY };
  };
  const handleEnd = () => { isDragging.current = false; };
  const handleWheel = (e: React.WheelEvent) => { zoom.current -= e.deltaY * 0.001; zoom.current = Math.max(0.5, Math.min(3.0, zoom.current)); };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-screen bg-black overflow-hidden font-sans cursor-grab active:cursor-grabbing"
      onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
      onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX, e.touches[0].clientY)}
      onTouchEnd={handleEnd}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} className="block absolute top-0 left-0 w-full h-full pointer-events-none" />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.6)_100%)]"></div>
      <div className="absolute bottom-0 w-full h-[35%] flex flex-col items-center justify-end pb-12 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent backdrop-blur-[1px]"></div>
        
        <div className="relative z-10 text-center w-full px-4 max-w-4xl mx-auto">
          {/* Main Title - Ornate Pinyon Script Font */}
          <h1 
            className="text-4xl md:text-6xl font-normal mb-2 tracking-wide drop-shadow-[0_0_20px_rgba(255,215,0,0.7)] bg-clip-text text-transparent bg-gradient-to-b from-yellow-100 via-yellow-400 to-yellow-800" 
            style={{ fontFamily: '"Pinyon Script", cursive' }}
          >
            Merry Christmas
          </h1>
          
          <div className={`transition-opacity duration-1000 ease-in-out h-16 md:h-24 flex items-center justify-center ${fade ? 'opacity-100' : 'opacity-0'}`}>
            <p 
              className="text-lg md:text-3xl font-normal leading-relaxed bg-clip-text text-transparent bg-gradient-to-r from-yellow-200/80 via-white to-yellow-200/80 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]" 
              style={{ fontFamily: '"Parisienne", cursive' }}
            >
              {GREETINGS[greetingIndex]}
            </p>
          </div>

          <p 
            className="text-lg md:text-2xl font-normal mt-2 opacity-90 tracking-[0.1em] bg-clip-text text-transparent bg-gradient-to-b from-yellow-200 via-yellow-500 to-yellow-800 drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]" 
            style={{ fontFamily: '"Pinyon Script", cursive' }}
          >
            From Mengjie
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;