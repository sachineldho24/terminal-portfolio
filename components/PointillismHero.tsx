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
  sizeRatio: number;
  opacity: number;
  r: number;
  g: number;
  b: number;
  delay: number;
  vx: number;
  vy: number;
}

interface PointillismPortraitProps {
  scrollProgress: number;
}

const VS_SOURCE = `
  attribute vec2 a_texCoord;
  attribute vec2 a_scatterPos;
  attribute float a_delay;
  attribute float a_sizeRatio;
  attribute float a_opacity;
  attribute vec3 a_color;
  attribute vec2 a_velocity;

  uniform float u_scrollProgress;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec4 u_layout; // offsetX, offsetY, drawWidth, drawHeight
  uniform float u_sampleWidth;

  varying vec4 v_color;
  varying float v_pointSize;

  float easeInOutCubic(float t) {
    if (t < 0.5) {
      return 4.0 * t * t * t;
    } else {
      float val = -2.0 * t + 2.0;
      return 1.0 - (val * val * val) / 2.0;
    }
  }

  void main() {
    float assemblyProgress = min(1.0, u_scrollProgress / 0.55);
    float particleProgress = clamp((assemblyProgress - a_delay) / (1.0 - a_delay), 0.0, 1.0);
    float easedProgress = easeInOutCubic(particleProgress);

    float tx = u_layout.x + a_texCoord.x * u_layout.z;
    float ty = u_layout.y + a_texCoord.y * u_layout.w;

    float x = a_scatterPos.x + (tx - a_scatterPos.x) * easedProgress;
    float y = a_scatterPos.y + (ty - a_scatterPos.y) * easedProgress;

    if (easedProgress < 1.0) {
      // Scale floating distance to match the layout scale (maintaining same visual float size across screens)
      float scaleFactor = u_layout.z / u_sampleWidth;
      float floatAmount = (1.0 - easedProgress) * 3.0 * scaleFactor;
      x += sin(u_time * a_velocity.x * 0.7 + a_delay * 100.0) * floatAmount;
      y += cos(u_time * a_velocity.y * 0.7 + a_delay * 100.0) * floatAmount;
    }

    vec2 clipSpace = (vec2(x, y) / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clipSpace.x, -clipSpace.y, 0.0, 1.0);

    float scaleFactor = u_layout.z / u_sampleWidth;
    float baseDotSize = a_sizeRatio * scaleFactor;
    float currentSize = baseDotSize * (1.0 + (1.0 - easedProgress) * 0.4);
    
    gl_PointSize = max(1.0, currentSize * 2.0);
    v_pointSize = gl_PointSize;

    float scatteredOpacity = 0.1;
    float currentOpacity = scatteredOpacity + (a_opacity - scatteredOpacity) * easedProgress;
    // Premultiply alpha for bright, correct blending on dark background
    v_color = vec4(a_color * currentOpacity, currentOpacity);
  }
`;

const FS_SOURCE = `
  precision mediump float;
  varying vec4 v_color;
  varying float v_pointSize;

  void main() {
    float dist = distance(gl_PointCoord, vec2(0.5));
    // Use smoothstep to create a soft, anti-aliased edge (1.5 physical pixels wide)
    // This removes WebGL aliasing/snapping artifacts and mimics subpixel rendering
    float delta = 1.5 / v_pointSize;
    float alpha = smoothstep(0.5, 0.5 - delta, dist);
    if (alpha <= 0.0) {
      discard;
    }
    gl_FragColor = vec4(v_color.rgb, v_color.a * alpha);
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error:', gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function createProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string) {
  const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
  const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

const PointillismHero: React.FC<PointillismPortraitProps> = ({ scrollProgress }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starCanvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const starsRef = useRef<Star[]>([]);
  const animFrameRef = useRef<number>(0);
  const progressRef = useRef(0);
  const imageLoadedRef = useRef(false);
  const sampleWidthRef = useRef(350);
  const layoutRef = useRef({ offsetX: 0, offsetY: 0, drawWidth: 0, drawHeight: 0 });
  const isVisibleRef = useRef(true);

  // WebGL Refs
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const bufferRef = useRef<WebGLBuffer | null>(null);

  // Keep progress ref in sync with prop
  useEffect(() => {
    progressRef.current = scrollProgress;
  }, [scrollProgress]);

  // Sample the image and create particles
  const initParticles = useCallback((img: HTMLImageElement, canvasWidth: number, canvasHeight: number) => {
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;

    const imgAspect = img.width / img.height;

    const sampleWidth = Math.min(img.width, 500);
    const sampleHeight = Math.round(sampleWidth / imgAspect);
    sampleWidthRef.current = sampleWidth;

    offscreen.width = sampleWidth;
    offscreen.height = sampleHeight;
    offCtx.drawImage(img, 0, 0, sampleWidth, sampleHeight);

    const imageData = offCtx.getImageData(0, 0, sampleWidth, sampleHeight);
    const pixels = imageData.data;
    const particles: Particle[] = [];

    const step = 1;

    for (let y = 0; y < sampleHeight; y += step) {
      for (let x = 0; x < sampleWidth; x += step) {
        const jitterX = (Math.random() - 0.5) * 0.4;
        const jitterY = (Math.random() - 0.5) * 0.4;
        const jx = Math.max(0, Math.min(sampleWidth - 1, Math.round(x + jitterX)));
        const jy = Math.max(0, Math.min(sampleHeight - 1, Math.round(y + jitterY)));

        const i = (jy * sampleWidth + jx) * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        if (a < 30) continue;

        const intensity = Math.min(1.0, (g / 255) * 1.55);

        if (intensity < 0.12) continue;

        const imgCenterX = sampleWidth * 0.5;
        const imgCenterY = sampleHeight * 0.5;
        const dx = x - imgCenterX;
        const dy = y - imgCenterY;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);
        
        const maxRadius = sampleWidth * 0.49;
        const vignette = Math.max(0, 1 - Math.pow(distFromCenter / maxRadius, 2));

        if (vignette <= 0) continue;

        // Add subtle sub-pixel jitter to target coordinates to break perfect pixel alignment grids
        const ntx = (x + (Math.random() - 0.5) * 1.2) / sampleWidth;
        const nty = (y + (Math.random() - 0.5) * 1.2) / sampleHeight;
        const dotOpacity = intensity * vignette;
        const sizeRatio = step > 1 ? 0.65 : 0.52;

        const dpr = window.devicePixelRatio || 1;
        const sx = (Math.random() * canvasWidth * 1.4 - canvasWidth * 0.2) * dpr;
        const sy = (Math.random() * canvasHeight * 1.4 - canvasHeight * 0.2) * dpr;

        particles.push({
          ntx, nty,
          x: sx, y: sy,
          sx, sy,
          sizeRatio,
          opacity: dotOpacity,
          r, g, b,
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

    // Compile WebGL buffer data
    const gl = glRef.current;
    if (gl) {
      const data = new Float32Array(particles.length * 12);
      for (let idx = 0; idx < particles.length; idx++) {
        const p = particles[idx];
        const offset = idx * 12;
        data[offset + 0] = p.ntx;
        data[offset + 1] = p.nty;
        data[offset + 2] = p.sx;
        data[offset + 3] = p.sy;
        data[offset + 4] = p.delay;
        data[offset + 5] = p.sizeRatio;
        data[offset + 6] = p.opacity;
        data[offset + 7] = p.r / 255;
        data[offset + 8] = p.g / 255;
        data[offset + 9] = p.b / 255;
        data[offset + 10] = p.vx;
        data[offset + 11] = p.vy;
      }

      if (!bufferRef.current) {
        bufferRef.current = gl.createBuffer();
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, bufferRef.current);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    }

    const stars: Star[] = [];
    const numStars = 450;
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight,
        size: 0.4 + Math.random() * 1.8,
        opacity: 0.05 + Math.random() * 0.37,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
      });
    }
    starsRef.current = stars;

    imageLoadedRef.current = true;
  }, []);

  // Set up WebGL Context
  const setupWebGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true });
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
    glRef.current = gl;

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); // Premultiplied alpha blending

    const program = createProgram(gl, VS_SOURCE, FS_SOURCE);
    if (!program) return;
    programRef.current = program;
  }, []);

  // Compute layout offsets only when needed
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

  // Size the canvases to match parent viewport
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const starCanvas = starCanvasRef.current;
    if (!canvas || !starCanvas) return;

    const dpr = window.devicePixelRatio || 1;
    const parent = canvas.parentElement;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    starCanvas.width = rect.width * dpr;
    starCanvas.height = rect.height * dpr;
    starCanvas.style.width = `${rect.width}px`;
    starCanvas.style.height = `${rect.height}px`;

    const starCtx = starCanvas.getContext('2d');
    if (starCtx) {
      starCtx.resetTransform();
      starCtx.scale(dpr, dpr);
    }

    const gl = glRef.current;
    if (gl) {
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    return { width: rect.width, height: rect.height };
  }, []);

  // Render loop
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const starCanvas = starCanvasRef.current;
    if (!canvas || !starCanvas) return;

    if (!isVisibleRef.current) {
      animFrameRef.current = requestAnimationFrame(render);
      return;
    }

    const starCtx = starCanvas.getContext('2d');
    const gl = glRef.current;
    const program = programRef.current;
    const buffer = bufferRef.current;

    if (!starCtx || !gl || !program || !buffer) {
      animFrameRef.current = requestAnimationFrame(render);
      return;
    }

    const particles = particlesRef.current;
    const stars = starsRef.current;
    const progress = progressRef.current;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;

    // 1. Draw floating stars on 2D canvas
    starCtx.clearRect(0, 0, w, h);
    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];
      s.x += s.vx;
      s.y += s.vy;
      if (s.x < 0) s.x = w;
      if (s.x > w) s.x = 0;
      if (s.y < 0) s.y = h;
      if (s.y > h) s.y = 0;

      starCtx.beginPath();
      starCtx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      starCtx.fillStyle = '#22c55e';
      starCtx.globalAlpha = s.opacity;
      starCtx.fill();
    }
    starCtx.globalAlpha = 1;

    // 2. Draw portrait using WebGL program
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    if (!imageLoadedRef.current || particles.length === 0) {
      animFrameRef.current = requestAnimationFrame(render);
      return;
    }

    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    const stride = 12 * 4;

    const locTexCoord = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(locTexCoord);
    gl.vertexAttribPointer(locTexCoord, 2, gl.FLOAT, false, stride, 0);

    const locScatterPos = gl.getAttribLocation(program, 'a_scatterPos');
    gl.enableVertexAttribArray(locScatterPos);
    gl.vertexAttribPointer(locScatterPos, 2, gl.FLOAT, false, stride, 2 * 4);

    const locDelay = gl.getAttribLocation(program, 'a_delay');
    gl.enableVertexAttribArray(locDelay);
    gl.vertexAttribPointer(locDelay, 1, gl.FLOAT, false, stride, 4 * 4);

    const locSizeRatio = gl.getAttribLocation(program, 'a_sizeRatio');
    gl.enableVertexAttribArray(locSizeRatio);
    gl.vertexAttribPointer(locSizeRatio, 1, gl.FLOAT, false, stride, 5 * 4);

    const locOpacity = gl.getAttribLocation(program, 'a_opacity');
    gl.enableVertexAttribArray(locOpacity);
    gl.vertexAttribPointer(locOpacity, 1, gl.FLOAT, false, stride, 6 * 4);

    const locColor = gl.getAttribLocation(program, 'a_color');
    gl.enableVertexAttribArray(locColor);
    gl.vertexAttribPointer(locColor, 3, gl.FLOAT, false, stride, 7 * 4);

    const locVelocity = gl.getAttribLocation(program, 'a_velocity');
    gl.enableVertexAttribArray(locVelocity);
    gl.vertexAttribPointer(locVelocity, 2, gl.FLOAT, false, stride, 10 * 4);

    const time = Date.now() * 0.001;
    const { offsetX, offsetY, drawWidth, drawHeight } = layoutRef.current;

    gl.uniform1f(gl.getUniformLocation(program, 'u_scrollProgress'), progress);
    gl.uniform1f(gl.getUniformLocation(program, 'u_time'), time);
    gl.uniform2f(gl.getUniformLocation(program, 'u_resolution'), canvas.width, canvas.height);
    gl.uniform4f(
      gl.getUniformLocation(program, 'u_layout'),
      offsetX * dpr,
      offsetY * dpr,
      drawWidth * dpr,
      drawHeight * dpr
    );
    gl.uniform1f(gl.getUniformLocation(program, 'u_sampleWidth'), sampleWidthRef.current);

    gl.drawArrays(gl.POINTS, 0, particles.length);

    animFrameRef.current = requestAnimationFrame(render);
  }, []);

  const handleResize = useCallback(() => {
    setupCanvas();
  }, [setupCanvas]);

  useEffect(() => {
    setupWebGL();
    const dims = setupCanvas();
    if (!dims) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = '/developer-face.png';
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
      const gl = glRef.current;
      if (gl && bufferRef.current) {
        gl.deleteBuffer(bufferRef.current);
      }
    };
  }, [setupWebGL, setupCanvas, initParticles, render, handleResize, updateLayout]);

  return (
    <>
      <canvas
        ref={starCanvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ background: 'transparent', zIndex: 4 }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ background: 'transparent', zIndex: 5 }}
      />
    </>
  );
};

export default PointillismHero;
