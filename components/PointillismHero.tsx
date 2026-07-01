import React, { useRef, useEffect, useCallback } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  vx: number;
  vy: number;
}

interface Particle {
  ntx: number; // Normalized X coordinate inside face bounding box (0..1)
  nty: number; // Normalized Y coordinate inside face bounding box (0..1)
  x: number;
  y: number;
  sx: number;
  sy: number;
  sizeRatio: number; // Size ratio relative to sample grid spacing
  opacity: number;
  color: string; // Original RGB color from the source image
  delay: number;
  vx: number;
  vy: number;
}

interface PointillismPortraitProps {
  scrollProgress: number;
}

const PointillismHero: React.FC<PointillismPortraitProps> = ({ scrollProgress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const animFrameRef = useRef<number>(0);
  const progressRef = useRef(0);
  const imageLoadedRef = useRef(false);
  const sampleWidthRef = useRef(350);
  const layoutRef = useRef({ offsetX: 0, offsetY: 0, drawWidth: 0, drawHeight: 0 });
  const isVisibleRef = useRef(true);

  // Keep progress ref in sync with prop
  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  const easeInOutCubic = (t: number): number => {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  };

  // Sample the image and create particles
  const initParticles = useCallback((img: HTMLImageElement, canvasWidth: number, canvasHeight: number) => {
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    const imgAspect = img.width / img.height;

    // Higher sample resolution for better detail
    const sampleWidth = Math.min(img.width, 500);
    const sampleHeight = Math.round(sampleWidth / imgAspect);
    sampleWidthRef.current = sampleWidth;

    offscreen.width = sampleWidth;
    offscreen.height = sampleHeight;
    offCtx.drawImage(img, 0, 0, sampleWidth, sampleHeight);

    const imageData = offCtx.getImageData(0, 0, sampleWidth, sampleHeight);
    const pixels = imageData.data;
    const particles: Particle[] = [];

    // Adaptive step to bound particle count within budget (e.g. 9000 particles)
    const TARGET_PARTICLE_BUDGET = 9000;
    const estimatedDensePixels = sampleWidth * sampleHeight;
    const step = Math.max(1, Math.round(Math.sqrt(estimatedDensePixels / TARGET_PARTICLE_BUDGET)));

    for (let y = 0; y < sampleHeight; y += step) {
      for (let x = 0; x < sampleWidth; x += step) {
        // Very subtle jitter just to break hard pixel edges
        const jitterX = (Math.random() - 0.5) * 0.4;
        const jitterY = (Math.random() - 0.5) * 0.4;
        const jx = Math.max(0, Math.min(sampleWidth - 1, Math.round(x + jitterX)));
        const jy = Math.max(0, Math.min(sampleHeight - 1, Math.round(y + jitterY)));

        const i = (jy * sampleWidth + jx) * 4;
        const r = pixels[i];
        const g = pixels[i + 1]; // Green channel
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        if (a < 30) continue;

        // Boost intensity for rich, bright green colors
        const intensity = Math.min(1.0, (g / 255) * 1.55);

        // Skip background
        if (intensity < 0.12) continue;

        // Vignette mask to fade outermost pixels smoothly
        const imgCenterX = sampleWidth * 0.5;
        const imgCenterY = sampleHeight * 0.5;
        const dx = x - imgCenterX;
        const dy = y - imgCenterY;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);
        
        const maxRadius = sampleWidth * 0.49;
        const vignette = Math.max(0, 1 - Math.pow(distFromCenter / maxRadius, 2));

        if (vignette <= 0) continue;

        // Clean normalized coordinate
        const ntx = x / sampleWidth;
        const nty = y / sampleHeight;

        // Opacity
        const dotOpacity = intensity * vignette;

        // Base size ratio (adjusted slightly larger at higher step counts to retain dense visual feel)
        const sizeRatio = step > 1 ? 0.65 : 0.52;

        // Capture original color
        const color = `rgb(${r}, ${g}, ${b})`;

        // Scatter position
        const sx = Math.random() * canvasWidth * 1.4 - canvasWidth * 0.2;
        const sy = Math.random() * canvasHeight * 1.4 - canvasHeight * 0.2;

        particles.push({
          ntx, nty,
          x: sx, y: sy,
          sx, sy,
          sizeRatio,
          opacity: dotOpacity,
          color,
          delay: Math.random() * 0.35,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
        });
      }
    }

    // Sort by distance from center of the face for radial assembly
    particles.sort((a, b) => {
      const distA = Math.sqrt((a.ntx - 0.5) ** 2 + (a.nty - 0.5) ** 2);
      const distB = Math.sqrt((b.ntx - 0.5) ** 2 + (b.nty - 0.5) ** 2);
      return distA - distB;
    });

    particles.forEach((p, i) => {
      p.delay = (i / particles.length) * 0.45;
    });

    particlesRef.current = particles;

    // Initialize background floating stars (space dust) - denser & more visible to match Reference.png
    const stars: Star[] = [];
    const numStars = 450; // Increased count
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        // Larger size range (up to 2.2px) for visible dust
        size: 0.4 + Math.random() * 1.8,
        // Brighter opacity range (up to 0.42)
        opacity: 0.05 + Math.random() * 0.37,
        // Slightly faster floating movement
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
      });
    }
    starsRef.current = stars;

    imageLoadedRef.current = true;
  }, []);

  // Compute layout offsets only when needed, not on every frame
  const updateLayout = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    const imgAspect = 1.0;
    let drawWidth = w * 0.38;
    let drawHeight = drawWidth;
    let offsetX = w * 0.55;
    let offsetY = (h - drawHeight) / 2;

    const placeholder = document.getElementById('portrait-placeholder');
    if (placeholder) {
      const pRect = placeholder.getBoundingClientRect();
      const cRect = canvas.getBoundingClientRect();

      const pWidth = pRect.width;
      const pHeight = pRect.height;
      offsetX = pRect.left - cRect.left;
      offsetY = pRect.top - cRect.top;

      // Fit aspect ratio within placeholder boundaries (contain)
      if (pWidth / imgAspect <= pHeight) {
        drawWidth = pWidth;
        drawHeight = drawWidth / imgAspect;
        offsetY += (pHeight - drawHeight) / 2;
      } else {
        drawHeight = pHeight;
        drawWidth = drawHeight * imgAspect;
        offsetX += (pWidth - drawWidth) / 2;
      }
    }

    layoutRef.current = { offsetX, offsetY, drawWidth, drawHeight };
  }, []);

  // Render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (!isVisibleRef.current) {
      animFrameRef.current = requestAnimationFrame(render);
      return; // skip drawing entirely when offscreen
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles = particlesRef.current;
    const stars = starsRef.current;
    const progress = progressRef.current;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    ctx.clearRect(0, 0, w, h);

    if (!imageLoadedRef.current || particles.length === 0) {
      animFrameRef.current = requestAnimationFrame(render);
      return;
    }

    const time = Date.now() * 0.001;

    // Draw background floating stars
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.x += s.vx;
      s.y += s.vy;

      // Wrap around edges
      if (s.x < 0) s.x = w;
      if (s.x > w) s.x = 0;
      if (s.y < 0) s.y = h;
      if (s.y > h) s.y = 0;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = '#22c55e'; // Green space dust
      ctx.globalAlpha = s.opacity;
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    const { offsetX, offsetY, drawWidth, drawHeight } = layoutRef.current;

    // Assembly normalization: completes fully at 55% of the total scroll range
    const assemblyProgress = Math.min(1, progress / 0.55);
    const scaleFactor = drawWidth / sampleWidthRef.current;

    // Draw particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      const particleProgress = Math.max(0, Math.min(1, (assemblyProgress - p.delay) / (1 - p.delay)));
      const easedProgress = easeInOutCubic(particleProgress);

      // Compute dynamic target coordinate on this frame
      const tx = offsetX + p.ntx * drawWidth;
      const ty = offsetY + p.nty * drawHeight;

      // Interpolate from scattered to dynamic target
      p.x = p.sx + (tx - p.sx) * easedProgress;
      p.y = p.sy + (ty - p.sy) * easedProgress;

      // Gentle floating when scattered
      if (easedProgress < 1) {
        const floatAmount = (1 - easedProgress) * 3;
        p.x += Math.sin(time * p.vx * 0.7 + i * 0.01) * floatAmount;
        p.y += Math.cos(time * p.vy * 0.7 + i * 0.01) * floatAmount;
      }

      // Fade-in opacity
      const scatteredOpacity = 0.1;
      const assembledOpacity = p.opacity;
      const currentOpacity = scatteredOpacity + (assembledOpacity - scatteredOpacity) * easedProgress;

      // Render size
      const baseDotSize = p.sizeRatio * scaleFactor;
      const currentSize = baseDotSize * (1 + (1 - easedProgress) * 0.4);

      ctx.fillStyle = p.color;
      ctx.globalAlpha = currentOpacity;

      // Pixel-perfect rectangle drawing for small sizes bypasses circular subpixel anti-aliasing blur
      if (currentSize <= 1.4) {
        ctx.fillRect(p.x - currentSize, p.y - currentSize, currentSize * 2, currentSize * 2);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, currentSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;

    animFrameRef.current = requestAnimationFrame(render);
  }, []);

  // Size the canvas to match parent viewport
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dpr = window.devicePixelRatio || 1;
    const parent = canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);

    return { width: rect.width, height: rect.height };
  }, []);

  // Handle resize
  const handleResize = useCallback(() => {
    setupCanvas();
  }, [setupCanvas]);

  // Init
  useEffect(() => {
    const dims = setupCanvas();
    if (!dims) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/developer-face.png?t=' + Date.now();
    img.onload = () => {
      initParticles(img, dims.width, dims.height);
      updateLayout();
    };

    animFrameRef.current = requestAnimationFrame(render);

    let resizeTicking = false;
    const onResize = () => {
      handleResize();
      if (!resizeTicking) {
        resizeTicking = true;
        requestAnimationFrame(() => {
          updateLayout();
          resizeTicking = false;
        });
      }
    };

    // ResizeObserver on the placeholder catches layout shifts scroll/resize doesn't
    const ro = new ResizeObserver(() => updateLayout());
    const placeholder = document.getElementById('portrait-placeholder');
    if (placeholder) ro.observe(placeholder);

    window.addEventListener('resize', onResize);

    const canvasEl = canvasRef.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        isVisibleRef.current = entry.isIntersecting;
      },
      { rootMargin: '200px 0px' }
    );
    if (canvasEl) io.observe(canvasEl);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('resize', onResize);
      ro.disconnect();
      io.disconnect();
    };
  }, [setupCanvas, initParticles, render, handleResize, updateLayout]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ background: 'transparent', zIndex: 5 }}
    />
  );
};

export default PointillismHero;
