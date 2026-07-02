import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PROJECTS, SOCIAL_LINKS, CONTACT_EMAIL } from '../constants';
import TypingText from '../components/TypingText';
import ProjectListItem from '../components/ProjectListItem';
import PointillismHero from '../components/PointillismHero';
import { Project } from '../types';
import { MapPin, Mail, Send, Github, Linkedin, Twitter, Terminal, Cpu } from 'lucide-react';

const Home: React.FC = () => {
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);
  const [systemReady, setSystemReady] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const projectsRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const aboutWrapperRef = useRef<HTMLDivElement>(null);
  const [aboutScrollProgress, setAboutScrollProgress] = useState(0);

  const [isDesktop, setIsDesktop] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const skillsWrapperRef = useRef<HTMLDivElement>(null);
  const [skillsScrollProgress, setSkillsScrollProgress] = useState(0);

  // Track scroll progress for pointillism animation
  const heroWrapperRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let ticking = false;

    const measure = () => {
      ticking = false;

      const heroWrapper = heroWrapperRef.current;
      if (heroWrapper) {
        const rect = heroWrapper.getBoundingClientRect();
        const scrollRange = heroWrapper.offsetHeight - window.innerHeight;
        if (scrollRange > 0) {
          const progress = Math.max(0, Math.min(1, -rect.top / scrollRange));
          setScrollProgress(progress);
        }
      }

      if (isDesktop && skillsWrapperRef.current) {
        const wrapper = skillsWrapperRef.current;
        const rect = wrapper.getBoundingClientRect();
        const scrollRange = wrapper.offsetHeight - window.innerHeight;
        if (scrollRange > 0) {
          const progress = Math.max(0, Math.min(1, -rect.top / scrollRange));
          setSkillsScrollProgress(progress);
        }
      }

      // About section scroll progress
      const aboutWrapper = aboutWrapperRef.current;
      if (aboutWrapper) {
        const rect = aboutWrapper.getBoundingClientRect();
        const scrollRange = aboutWrapper.offsetHeight - window.innerHeight;
        if (scrollRange > 0) {
          const progress = Math.max(0, Math.min(1, -rect.top / scrollRange));
          setAboutScrollProgress(progress);
        }
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(measure);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    measure();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isDesktop]);

  // Mouse tracking for the hover card
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let ticking = false;
    let last = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      last = { x: e.clientX, y: e.clientY };
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          setMousePos(last);
          ticking = false;
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const date = now.toISOString().split('T')[0];
      const time = now.toISOString().split('T')[1].split('.')[0];
      setCurrentTime(`[ ${date} | ${time} UTC ]`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // ── Hacker text decryption system ──
  // Glitch charset for the scramble effect
  const GLITCH_CHARS = '01アイウエオカキクケコサシスセソ!@#$%^&*<>{}[]|/\\~`░▒▓█▀▄';

  // Deterministic pseudo-random from seed (avoids re-randomizing every render)
  const seededChar = useCallback((index: number, tick: number) => {
    const h = ((index * 2654435761) ^ (tick * 40503)) >>> 0;
    return GLITCH_CHARS[h % GLITCH_CHARS.length];
  }, []);

  // Generates the decrypted text for a line based on scroll progress
  // Returns an array of {char, resolved} objects
  const decryptLine = useCallback((text: string, lineIndex: number, totalLines: number) => {
    const revealZone = 0.65;
    const lineStart = (lineIndex / totalLines) * revealZone;
    const lineEnd = lineStart + (1.2 / totalLines) * revealZone + 0.06;
    const lineProgress = Math.max(0, Math.min(1, (aboutScrollProgress - lineStart) / (lineEnd - lineStart)));

    // How many characters are fully resolved
    const resolvedCount = Math.floor(lineProgress * text.length);
    // Sub-character progress for the "active" character (creates cycling effect)
    const subProgress = (lineProgress * text.length) - resolvedCount;
    // Use scroll progress as a tick for glyph cycling
    const tick = Math.floor(aboutScrollProgress * 200);

    return text.split('').map((char, i) => {
      if (i < resolvedCount) {
        return { char, resolved: true, active: false };
      } else if (i === resolvedCount) {
        // Active decrypting character — cycles through glyphs
        if (char === ' ') return { char: ' ', resolved: false, active: true };
        return { char: subProgress > 0.7 ? char : seededChar(i + lineIndex * 100, tick), resolved: false, active: true };
      } else if (i < resolvedCount + 8) {
        // "Wake zone" — nearby chars flicker with glyphs
        if (char === ' ') return { char: ' ', resolved: false, active: false };
        return { char: seededChar(i + lineIndex * 100, tick), resolved: false, active: false };
      } else {
        // Not yet reached — invisible
        return { char: '', resolved: false, active: false };
      }
    });
  }, [aboutScrollProgress, seededChar]);

  // Line visibility (is it started at all?)
  const isLineVisible = useCallback((lineIndex: number, totalLines: number) => {
    const revealZone = 0.65;
    const lineStart = (lineIndex / totalLines) * revealZone;
    return aboutScrollProgress >= lineStart - 0.01;
  }, [aboutScrollProgress]);

  // Image reveal: triggers after ~60% of the about scroll
  const imageRevealProgress = Math.max(0, Math.min(1, (aboutScrollProgress - 0.55) / 0.25));
  const imageEased = imageRevealProgress < 0.5
    ? 4 * imageRevealProgress * imageRevealProgress * imageRevealProgress
    : 1 - Math.pow(-2 * imageRevealProgress + 2, 3) / 2;

  // Render a single hacker-decoded line
  const HackerLine = useCallback(({ text, lineIndex, totalLines, prefix }: { text: string; lineIndex: number; totalLines: number; prefix?: React.ReactNode }) => {
    const visible = isLineVisible(lineIndex, totalLines);
    if (!visible) return null; // don't render anything until line's scroll zone starts
    const decoded = decryptLine(text, lineIndex, totalLines);
    const allResolved = decoded.every(d => d.resolved);

    return (
      <div className="font-mono text-sm md:text-base leading-relaxed mb-4">
        {prefix}
        {decoded.map((d, i) => {
          if (d.char === '') return null;
          if (d.resolved) {
            return <span key={i} className="text-slate-300">{d.char}</span>;
          }
          if (d.active) {
            return <span key={i} className="text-green-400 font-bold" style={{ textShadow: '0 0 8px #22c55e' }}>{d.char}</span>;
          }
          return <span key={i} className="text-green-500/40">{d.char}</span>;
        })}
        {!allResolved && <span className="inline-block w-2 h-4 bg-green-500 align-middle ml-0.5 animate-pulse shadow-[0_0_8px_#22c55e]" />}
      </div>
    );
  }, [decryptLine, isLineVisible]);

  const getCardStyle = (index: number) => {
    if (!isDesktop) return {};

    const p = skillsScrollProgress;

    // Card grid slot targets relative to parent container center (tighter fit to prevent clipping)
    const columns = [ -380, 0, 380 ];
    const rows = [ -135, 135 ];
    const gridX = columns[index % 3];
    const gridY = rows[Math.floor(index / 3)];

    let currentX = 0;
    let currentY = 0;
    let currentAngle = 0;
    let zOffset = 0;

    // Rainbow fanning hand arc angle (-55deg to +55deg)
    const arcAngle = (index - 2.5) * 22;

    // Phase 1 & 2: Fan out into a fanning hand rainbow arc (p = 0.0 to 0.35)
    if (p <= 0.35) {
      const fanP = p / 0.35;
      const rad = (arcAngle * Math.PI) / 180;
      // Keep cards compact to avoid fanning upwards into the title
      const radius = 10 + fanP * (120 - 10);

      currentX = radius * Math.sin(rad);
      currentY = -radius * Math.cos(rad) + (fanP * 50); // Shift down as it fans out
      currentAngle = arcAngle * fanP; // angle fanning out
      zOffset = index * -5 * (1 - fanP);
    } else {
      // Phase 3: Grid assembly one-by-one (p = 0.35 to 0.85)
      // Each card has a transition window of 0.08 progress
      const cardStart = 0.35 + index * 0.08;
      const cardEnd = cardStart + 0.08;

      let t = 0;
      if (p > cardEnd) {
        t = 1;
      } else if (p >= cardStart) {
        t = (p - cardStart) / 0.08;
        // Smooth ease-in-out curve for the flight
        t = t * t * (3 - 2 * t);
      }

      const rad = (arcAngle * Math.PI) / 180;
      const circleX = 120 * Math.sin(rad);
      const circleY = -120 * Math.cos(rad) + 50;

      // Interpolate from rainbow arc position to grid position
      currentX = circleX + t * (gridX - circleX);
      currentY = circleY + t * (gridY - circleY);
      currentAngle = arcAngle + t * (0 - arcAngle);
      zOffset = t * 2;
    }

    return {
      position: 'absolute' as const,
      left: 'calc(50% - 180px)',
      top: 'calc(50% - 125px)', // center coordinate relative to 520px container
      width: '360px',
      height: '250px',
      transform: `translate3d(${currentX}px, ${currentY}px, ${zOffset}px) rotateZ(${currentAngle}deg)`,
      // Smooth out transitions when scrolling
      transition: 'transform 0.8s cubic-bezier(0.1, 0.8, 0.2, 1), border-color 0.3s ease, box-shadow 0.3s ease',
      zIndex: p > 0.35 + index * 0.08 ? 20 + index : 10 - index,
      transformStyle: 'preserve-3d' as const,
      boxShadow: p > 0.35 
        ? '0 10px 30px -10px rgba(34, 197, 94, 0.15), 0 0 1px 1px rgba(34, 197, 94, 0.1)' 
        : '0 25px 50px -15px rgba(0, 0, 0, 0.95), 0 0 1px 1px rgba(34, 197, 94, 0.15)',
    };
  };

  return (
    <div className="min-h-screen font-mono bg-[#050505] text-slate-300">

      {/* --- HERO SECTION WITH POINTILLISM PORTRAIT --- */}
      {/* This tall wrapper provides the scroll distance that drives the animation */}
      <div id="home" ref={heroWrapperRef} style={{ height: '250vh' }}>
        <section className="sticky top-0 min-h-[100dvh] lg:h-[100dvh] flex flex-col px-4 sm:px-6 relative overflow-hidden">
          
          {/* Background full-viewport canvas for pointillism portrait */}
          <PointillismHero scrollProgress={scrollProgress} />
        
          {/* Top Bar Info */}
          <div className="absolute top-20 sm:top-24 left-4 sm:left-6 right-4 sm:right-6 flex justify-between items-start z-20 text-xs md:text-sm font-mono tracking-wide text-slate-500">
              <div className="flex items-center gap-2">
                  <span className="text-green-500">{'>'}</span>
                  <span className="text-slate-400">portfolio-main.sh</span>
              </div>
              <div className="text-slate-400">
                  {currentTime}
              </div>
          </div>

          {/* Main hero content — two column layout */}
          <div className="max-w-[1400px] mx-auto w-full z-10 flex-1 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10 pt-20 sm:pt-24">
              
              {/* LEFT: Text content (more compact, shifted upwards) */}
              <div className="w-full lg:w-[38%] flex-shrink-0 flex flex-col justify-center min-w-0 pt-0 lg:pt-2 lg:-mt-12">
                  <div className="mb-6 sm:mb-8">
                      <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-white tracking-tighter mb-1 relative z-10">
                          <span className="font-sans font-black tracking-tighter inline-flex items-baseline uppercase">
                              <span className="text-[#f1eae1] leading-none">A</span>
                              <span className="text-[#f1eae1] leading-none inline-block origin-bottom transform skew-x-[-21deg] ml-[2px]">I</span>
                          </span>
                      </h1>
                      <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-500 to-green-500 tracking-tighter mb-4 sm:mb-8 glitch uppercase relative z-10" data-text="ENGINEER">
                          <span className="relative inline-block">
                              ENGINEER
                              <span 
                                className="absolute left-0 right-0 h-[4px] sm:h-[5px] md:h-[6px] bg-green-500 top-[52%] -translate-y-1/2 shadow-[0_0_15px_#22c55e,0_0_5px_#22c55e] pointer-events-none z-20" 
                                style={{ transform: 'translateY(-50%)' }}
                              />
                          </span>
                      </h1>

                      <div className="space-y-3 pt-2">
                          <p className="text-slate-100 text-sm sm:text-base md:text-lg lg:text-xl max-w-xl font-mono font-medium tracking-wide">
                              building autonomous agents in production.
                          </p>
                          <p className="text-green-400 text-xs sm:text-sm font-mono font-semibold flex items-center gap-2">
                              <span className="text-green-400 font-bold">$</span>
                              <span>git commit -m "taught the machine to reason"</span>
                              <span className="w-1.5 h-4 bg-green-400 animate-pulse inline-block"></span>
                          </p>
                      </div>
                  </div>

                  {/* Explore file shell link mimicking mobile mockup */}
                  <div 
                    className="font-mono text-xs sm:text-sm tracking-wider transition-all duration-700"
                    style={{ 
                      opacity: scrollProgress < 0.05 ? 0.85 : 0,
                      transform: `translateY(${scrollProgress < 0.05 ? 0 : 10}px)`
                    }}
                  >
                      <span className="text-green-500">{'>'} </span>
                      <span className="text-slate-200">./explore.sh</span>
                      <span className="w-[8px] h-[15px] bg-green-500 inline-block align-middle ml-1 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                      <div className="w-[100px] h-[2px] bg-green-500/80 mt-1.5 shadow-[0_0_8px_#22c55e] hidden sm:block"></div>
                  </div>
              </div>

              {/* RIGHT: Pointillism portrait placeholder (fully mobile responsive, larger on desktop) */}
              <div 
                id="portrait-placeholder" 
                className="w-[95vw] sm:w-[85vw] md:w-[75vw] lg:w-[62%] h-[55vh] sm:h-[60vh] lg:h-[90vh] xl:w-[58%] xl:h-[92vh] flex-shrink-0 relative mt-6 lg:mt-0"
              />
          </div>

        </section>
      </div>

      {/* --- SKILLS SECTION --- */}
      <div 
        id="skills"
        ref={isDesktop ? skillsWrapperRef : null} 
        className={isDesktop ? "relative h-[350vh] bg-[#050505]" : "relative bg-[#050505] py-16 md:py-24"}
      >
        <section 
          className={isDesktop 
            ? "sticky top-0 h-[100dvh] flex flex-col justify-center px-4 sm:px-6 relative overflow-hidden"
            : "px-4 sm:px-6 relative"
          }
        >
          <div className="max-w-[1400px] mx-auto w-full font-mono">
            <div className="flex flex-col lg:flex-row items-stretch justify-between gap-10">
              
              {/* Left Column (Desktop Title) */}
              <div className="hidden lg:flex w-full lg:w-[24%] flex-shrink-0 flex-col justify-center pr-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-6">
                      <span className="text-green-500">{'>'}</span>
                      <span className="text-slate-400">cat skills.sh</span>
                  </div>

                  <div className="mb-6">
                      <h2 className="text-5xl lg:text-6xl font-black text-white tracking-tighter mb-4 uppercase leading-none">
                          SKILLS<span className="text-green-500 animate-pulse">_</span>
                      </h2>
                      <p className="text-slate-400 text-sm leading-relaxed">
                          Technologies, tools and concepts I work with to build intelligent software systems and polished interfaces.
                      </p>
                  </div>

                  <div className="font-mono text-xs mt-6">
                      <span className="text-green-500">{'>'} </span>
                      <span className="text-slate-200">skills_loaded</span>
                      <span className="w-[8px] h-[15px] bg-green-500 inline-block align-middle ml-1 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                  </div>
              </div>

              {/* Right Column / Content wrapper */}
              <div className="flex-1 flex flex-col justify-center min-w-0">
                  {/* Mobile-only Header */}
                  <div className="lg:hidden mb-8">
                      <div className="flex justify-between items-start text-xs font-mono text-slate-500 mb-6">
                          <div className="flex items-center gap-2">
                              <span className="text-green-500">{'>'}</span>
                              <span className="text-slate-400">cat skills</span>
                          </div>
                      </div>
                      <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-3 uppercase">
                          SKILLS<span className="text-green-500 animate-pulse">_</span>
                      </h2>
                      <p className="text-slate-400 text-sm sm:text-base">Technologies, tools and concepts I work with.</p>
                  </div>

                  {/* Cards Grid */}
                  <div 
                      className={isDesktop 
                        ? "relative w-full h-[520px] flex items-center justify-center scale-[0.62] xl:scale-[0.82] 2xl:scale-100 transition-transform origin-center" 
                        : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
                      }
                      style={isDesktop ? { 
                        perspective: '1200px', 
                        transformStyle: 'preserve-3d',
                      } : {}}
                  >
                      {/* 1. FRONTEND */}
                      <div 
                          style={getCardStyle(0)}
                          className="border border-green-500/20 bg-[#070707] rounded-lg p-5 pb-4 hover:border-green-500/40 transition-all duration-300 overflow-hidden flex flex-col"
                      >
                          <h3 className="text-green-500 text-sm md:text-base font-bold uppercase tracking-wider mb-2 flex items-center gap-2 flex-shrink-0">
                              <span>{'>'}</span> 1. FRONTEND
                          </h3>
                          <div className="flex-1 flex items-center justify-center">
                              <div className="grid grid-cols-4 gap-y-4 gap-x-3 justify-items-center text-center items-center w-full">
                                  {/* HTML5 */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/devicon--html5.svg" className="w-11 h-11 sm:w-14 sm:h-14 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125" alt="HTML5" />
                                      <span className="text-xs sm:text-[13px] md:text-[14px] text-slate-400 group-hover:text-white transition-colors duration-200">HTML5</span>
                                  </div>
                                  {/* CSS3 */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/devicon--css3.svg" className="w-11 h-11 sm:w-14 sm:h-14 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125" alt="CSS3" />
                                      <span className="text-xs sm:text-[13px] md:text-[14px] text-slate-400 group-hover:text-white transition-colors duration-200">CSS3</span>
                                  </div>
                                  {/* JavaScript */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/devicon--javascript.svg" className="w-11 h-11 sm:w-14 sm:h-14 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125" alt="JavaScript" />
                                      <span className="text-xs sm:text-[13px] md:text-[14px] text-slate-400 group-hover:text-white transition-colors duration-200">JavaScript</span>
                                  </div>
                                  {/* Next.js */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/devicon--nextjs.svg" className="w-11 h-11 sm:w-14 sm:h-14 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125 invert" alt="Next.js" />
                                      <span className="text-xs sm:text-[13px] md:text-[14px] text-slate-400 group-hover:text-white transition-colors duration-200">Next.js</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* 2. BACKEND */}
                      <div 
                          style={getCardStyle(1)}
                          className="border border-green-500/20 bg-[#070707] rounded-lg p-5 pb-4 hover:border-green-500/40 transition-all duration-300 overflow-hidden flex flex-col"
                      >
                          <h3 className="text-green-500 text-sm md:text-base font-bold uppercase tracking-wider mb-2 flex items-center gap-2 flex-shrink-0">
                              <span>{'>'}</span> 2. BACKEND
                          </h3>
                          <div className="flex-1 flex items-center justify-center">
                              <div className="grid grid-cols-4 gap-y-4 gap-x-3 justify-items-center text-center items-center w-full">
                                  {/* Python */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/devicon--python.svg" className="w-11 h-11 sm:w-14 sm:h-14 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125" alt="Python" />
                                      <span className="text-xs sm:text-[13px] md:text-[14px] text-slate-400 group-hover:text-white transition-colors duration-200">Python</span>
                                  </div>
                                  {/* SQL */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/sql.svg" className="w-11 h-11 sm:w-14 sm:h-14 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125" alt="SQL" />
                                      <span className="text-xs sm:text-[13px] md:text-[14px] text-slate-400 group-hover:text-white transition-colors duration-200">SQL</span>
                                  </div>
                                  {/* FastAPI */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/devicon--fastapi.svg" className="w-11 h-11 sm:w-14 sm:h-14 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125" alt="FastAPI" />
                                      <span className="text-xs sm:text-[13px] md:text-[14px] text-slate-400 group-hover:text-white transition-colors duration-200">FastAPI</span>
                                  </div>
                                  {/* Supabase */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/devicon--supabase.svg" className="w-11 h-11 sm:w-14 sm:h-14 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125" alt="Supabase" />
                                      <span className="text-xs sm:text-[13px] md:text-[14px] text-slate-400 group-hover:text-white transition-colors duration-200">Supabase</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* 3. AI/ML */}
                      <div 
                          style={getCardStyle(2)}
                          className="border border-green-500/20 bg-[#070707] rounded-lg p-5 pb-4 hover:border-green-500/40 transition-all duration-300 overflow-hidden flex flex-col"
                      >
                          <h3 className="text-green-500 text-sm md:text-base font-bold uppercase tracking-wider mb-2 flex items-center gap-2 flex-shrink-0">
                              <span>{'>'}</span> 3. AI/ML
                          </h3>
                          <div className="flex-1 flex items-center justify-center">
                              <div className="grid grid-cols-4 gap-y-4 gap-x-3 justify-items-center text-center items-center w-full">
                                  {/* LangChain */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <div className="w-11 h-11 sm:w-14 sm:h-14 flex items-center justify-center transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125 overflow-visible">
                                          <img src="/SVG_ICONS/Langchain_Icon.svg" className="w-[46px] h-[46px] sm:w-[58px] sm:h-[58px] max-w-none" alt="LangChain" />
                                      </div>
                                      <span className="text-xs sm:text-[13px] md:text-[14px] text-slate-400 group-hover:text-white transition-colors duration-200">LangChain</span>
                                  </div>
                                  {/* CrewAI */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/simple-icons--crewai.svg" className="w-11 h-11 sm:w-14 sm:h-14 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125 invert" alt="CrewAI" />
                                      <span className="text-xs sm:text-[13px] md:text-[14px] text-slate-400 group-hover:text-white transition-colors duration-200">CrewAI</span>
                                  </div>
                                  {/* MCP */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/gravity-ui--logo-mcp.svg" className="w-11 h-11 sm:w-14 sm:h-14 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125 invert" alt="MCP" />
                                      <span className="text-xs sm:text-[13px] md:text-[14px] text-slate-400 group-hover:text-white transition-colors duration-200">MCP</span>
                                  </div>
                                  {/* RAG */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/RAG_icon.svg" className="w-11 h-11 sm:w-14 sm:h-14 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125" alt="RAG" />
                                      <span className="text-xs sm:text-[13px] md:text-[14px] text-slate-400 group-hover:text-white transition-colors duration-200">RAG</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* 4. DEV TOOLS & PLATFORMS */}
                      <div 
                          style={getCardStyle(3)}
                          className="border border-green-500/20 bg-[#070707] rounded-lg p-5 pb-4 hover:border-green-500/40 transition-all duration-300 overflow-hidden flex flex-col"
                      >
                          <h3 className="text-green-500 text-sm md:text-base font-bold uppercase tracking-wider mb-2 flex items-center gap-2 flex-shrink-0">
                              <span>{'>'}</span> 4. DEV TOOLS & PLATFORMS
                          </h3>
                          <div className="flex-1 flex items-center justify-center">
                              <div className="grid grid-cols-3 gap-y-4 gap-x-4 items-center w-full">
                                  {/* Git */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/devicon--git.svg" className="w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125" alt="Git" />
                                      <span className="text-[11px] sm:text-xs md:text-[13px] text-slate-400 group-hover:text-white transition-colors duration-200">Git</span>
                                  </div>
                                  {/* GitHub */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/skill-icons--github-dark.svg" className="w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125" alt="GitHub" />
                                      <span className="text-[11px] sm:text-xs md:text-[13px] text-slate-400 group-hover:text-white transition-colors duration-200">GitHub</span>
                                  </div>
                                  {/* VS Code */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/devicon--vscode.svg" className="w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125" alt="VS Code" />
                                      <span className="text-[11px] sm:text-xs md:text-[13px] text-slate-400 group-hover:text-white transition-colors duration-200">VS Code</span>
                                  </div>
                                  {/* Cursor */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/devicon--cursor.svg" className="w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125 invert" alt="Cursor" />
                                      <span className="text-[11px] sm:text-xs md:text-[13px] text-slate-400 group-hover:text-white transition-colors duration-200">Cursor</span>
                                  </div>
                                  {/* Claude Code */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/material-icon-theme--claude.svg" className="w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125" alt="Claude Code" />
                                      <span className="text-[11px] sm:text-xs md:text-[13px] text-slate-400 group-hover:text-white transition-colors duration-200">Claude Code</span>
                                  </div>
                                  {/* Antigravity */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/Google_Antigravity-logo_brandlogos.net_e23c83.svg" className="w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125" alt="Antigravity" />
                                      <span className="text-[11px] sm:text-xs md:text-[13px] text-slate-400 group-hover:text-white transition-colors duration-200">Antigravity</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* 5. DATABASES & VECTOR DB */}
                      <div 
                          style={getCardStyle(4)}
                          className="border border-green-500/20 bg-[#070707] rounded-lg p-5 pb-3 hover:border-green-500/40 transition-all duration-300 overflow-hidden flex flex-col"
                      >
                          <h3 className="text-green-500 text-sm md:text-base font-bold uppercase tracking-wider mb-2 flex items-center gap-2 flex-shrink-0">
                              <span>{'>'}</span> 5. DATABASES & VECTOR DB
                          </h3>
                          <div className="flex-1 flex items-center justify-center">
                              <div className="grid grid-cols-5 gap-y-4 gap-x-1 justify-items-center text-center items-center w-full">
                                  {/* PostgreSQL */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/devicon--postgresql.svg" className="w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125" alt="PostgreSQL" />
                                      <span className="text-[10px] sm:text-xs md:text-[13px] text-slate-400 group-hover:text-white transition-colors duration-200">PostgreSQL</span>
                                  </div>
                                  {/* MySQL */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/logos--mysql.svg" className="w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125" alt="MySQL" />
                                      <span className="text-[10px] sm:text-xs md:text-[13px] text-slate-400 group-hover:text-white transition-colors duration-200">MySQL</span>
                                  </div>
                                  {/* MongoDB */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/devicon--mongodb.svg" className="w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125" alt="MongoDB" />
                                      <span className="text-[10px] sm:text-xs md:text-[13px] text-slate-400 group-hover:text-white transition-colors duration-200">MongoDB</span>
                                  </div>
                                  {/* Qdrant */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/logos--qdrant-icon.svg" className="w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125" alt="Qdrant" />
                                      <span className="text-[10px] sm:text-xs md:text-[13px] text-slate-400 group-hover:text-white transition-colors duration-200">Qdrant</span>
                                  </div>
                                  {/* Chroma */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/logos--chroma.svg" className="w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125" alt="Chroma" />
                                      <span className="text-[10px] sm:text-xs md:text-[13px] text-slate-400 group-hover:text-white transition-colors duration-200">Chroma</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* 6. CONCEPTS & STRENGTHS */}
                      <div 
                          style={getCardStyle(5)}
                          className="border border-green-500/20 bg-[#070707] rounded-lg p-5 pb-3 hover:border-green-500/40 transition-all duration-300 overflow-hidden flex flex-col"
                      >
                          <h3 className="text-green-500 text-sm md:text-base font-bold uppercase tracking-wider mb-2 flex items-center gap-2 flex-shrink-0">
                              <span>{'>'}</span> 6. CONCEPTS & STRENGTHS
                          </h3>
                          <div className="flex-1 flex items-center justify-center">
                              <div className="grid grid-cols-3 gap-y-4 gap-x-2 text-center items-start w-full">
                                  {/* Multi-source Integration */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer text-center">
                                      <img src="/concepts/multi_source.png" className="w-9 h-9 sm:w-10 sm:h-10 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125 object-contain" alt="Multi-source Integration" />
                                      <span className="text-[11px] sm:text-xs md:text-[13px] text-slate-400 group-hover:text-white transition-colors duration-200 leading-tight">Multi-source Integration</span>
                                  </div>
                                  {/* Problem Solving */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer text-center">
                                      <img src="/concepts/problem_solving.png" className="w-9 h-9 sm:w-10 sm:h-10 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125 object-contain" alt="Problem Solving" />
                                      <span className="text-[11px] sm:text-xs md:text-[13px] text-slate-400 group-hover:text-white transition-colors duration-200 leading-tight">Problem Solving</span>
                                  </div>
                                  {/* Analytical Thinking */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer text-center">
                                      <img src="/concepts/analytical_thinking.png" className="w-9 h-9 sm:w-10 sm:h-10 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125 object-contain" alt="Analytical Thinking" />
                                      <span className="text-[11px] sm:text-xs md:text-[13px] text-slate-400 group-hover:text-white transition-colors duration-200 leading-tight">Analytical Thinking</span>
                                  </div>
                                  {/* Team Collaboration */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer text-center">
                                      <img src="/concepts/team_collaboration.png" className="w-9 h-9 sm:w-10 sm:h-10 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125 object-contain" alt="Team Collaboration" />
                                      <span className="text-[11px] sm:text-xs md:text-[13px] text-slate-400 group-hover:text-white transition-colors duration-200 leading-tight">Team Collaboration</span>
                                  </div>
                                  {/* Communication */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer text-center">
                                      <img src="/concepts/communication.png" className="w-9 h-9 sm:w-10 sm:h-10 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125 object-contain" alt="Communication" />
                                      <span className="text-[11px] sm:text-xs md:text-[13px] text-slate-400 group-hover:text-white transition-colors duration-200 leading-tight">Communication</span>
                                  </div>
                                  {/* Continuous Learning */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer text-center">
                                      <img src="/concepts/continuous_learning.png" className="w-9 h-9 sm:w-10 sm:h-10 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125 object-contain" alt="Continuous Learning" />
                                      <span className="text-[11px] sm:text-xs md:text-[13px] text-slate-400 group-hover:text-white transition-colors duration-200 leading-tight">Continuous Learning</span>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>

                  {/* Mobile-only Footer */}
                  <div className="lg:hidden font-mono text-xs sm:text-sm">
                      <span className="text-green-500">{'>'} </span>
                      <span className="text-slate-200">skills_loaded</span>
                      <span className="w-[8px] h-[15px] bg-green-500 inline-block align-middle ml-1 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
                  </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* --- PROJECTS SECTION --- */}
      <section id="projects" className="pt-16 md:pt-20 pb-10 md:pb-14 px-6 relative bg-[#050505]" ref={projectsRef}>
        <div className="max-w-7xl mx-auto">
            {/* Title */}
            <div className="mb-10">
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-3 uppercase">
                    PROJECTS<span className="text-green-500 animate-pulse">_</span>
                </h2>
                <p className="text-slate-400 text-sm sm:text-base">Selected systems, applications, and source code.</p>
            </div>

            <div className="relative">
                {/* File List */}
                <div className="space-y-1">
                    {PROJECTS.map((project) => (
                        <ProjectListItem 
                            key={project.id} 
                            project={project} 
                            onHover={setHoveredProject} 
                            isHovered={hoveredProject?.id === project.id}
                        />
                    ))}
                    <div className="py-2 px-2 text-slate-600 animate-pulse">_</div>
                </div>

                {/* Hover Card (Terminal Popup Style - Reference Image 2) */}
                {hoveredProject && (
                     <div 
                        className="pointer-events-none fixed z-50 hidden lg:block"
                        style={{
                            left: mousePos.x + 40,
                            top: mousePos.y - 40,
                        }}
                     >
                        <div className="w-[550px] bg-[#0c0c0c]/95 border border-slate-600/50 backdrop-blur-sm shadow-2xl rounded-sm overflow-hidden text-sm">
                            
                            {/* Header */}
                            <div className="bg-[#1a1a1a] px-4 py-2 flex items-center gap-2 border-b border-slate-700/50">
                                <span className="text-green-500 text-xs">{'>'}</span>
                                <span className="text-slate-200 font-bold tracking-wide uppercase">
                                    {hoveredProject.name} <span className="text-slate-500">|</span> DESCRIPTION
                                </span>
                            </div>

                            {/* Content */}
                            <div className="p-6 relative overflow-hidden">
                                {/* Liquid/Wave background effect inside popup */}
                                <div className="absolute inset-0 bg-green-900/5 opacity-50">
                                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-green-500/5 to-transparent blur-xl transform rotate-12 scale-150"></div>
                                </div>

                                <div className="relative z-10 space-y-4 font-mono">
                                    <div>
                                        <div className="flex items-baseline gap-2 text-green-400 mb-1">
                                            <span>{'>'}</span>
                                            <span className="font-bold">Context:</span>
                                        </div>
                                        <p className="text-slate-300 pl-5 leading-relaxed">
                                            {hoveredProject.shortDescription}
                                        </p>
                                    </div>
                                    
                                    <div className="pl-5 space-y-2 text-slate-400 text-xs">
                                        <div>
                                            <span className="text-green-500 font-bold mr-2">Tech:</span>
                                            {hoveredProject.technologies.join(', ')}.
                                        </div>
                                        <div>
                                            <span className="text-green-500 font-bold mr-2">Status:</span>
                                            <span className="text-slate-200 uppercase">{hoveredProject.status}</span>.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                     </div>
                )}
            </div>
        </div>
      </section>

      {/* --- ABOUT SECTION (Scroll-Pinned — Hacker Decryption Reveal) --- */}
      <div 
        id="about" 
        ref={aboutWrapperRef} 
        className="relative bg-[#050505]"
        style={{ height: '300vh' }}
      >
        <section 
          ref={aboutRef}
          className="sticky top-0 h-[100dvh] flex flex-col justify-center px-6 overflow-hidden pt-20"
        >
          <div className="max-w-7xl mx-auto w-full">
            {/* Top bar — terminal-style */}
            <div 
              className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-6"
              style={{ opacity: aboutScrollProgress > 0 ? 1 : 0 }}
            >
              <span className="text-green-500">{'>'}</span>
              <span className="text-slate-400">decrypting ./about_me.dat</span>
              <span className="text-green-500/60 ml-2">[{Math.min(100, Math.round(aboutScrollProgress * 130))}%]</span>
              {aboutScrollProgress < 0.77 && <span className="w-1.5 h-4 bg-green-500 inline-block animate-pulse shadow-[0_0_6px_#22c55e]" />}
            </div>

            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
              {/* Left Column: Hacker text streaming */}
              <div className="flex-1 min-w-0">
                {/* Title — decrypts as the heading itself */}
                {isLineVisible(0, 8) && (() => {
                  const decoded = decryptLine('ABOUT ME', 0, 8);
                  const allResolved = decoded.every(d => d.resolved);
                  return (
                    <h2 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase mb-8 font-mono">
                      {decoded.map((d, i) => {
                        if (d.char === '') return null;
                        if (d.resolved) return <span key={i} className="text-white">{d.char}</span>;
                        if (d.active) return <span key={i} className="text-green-400" style={{ textShadow: '0 0 12px #22c55e' }}>{d.char}</span>;
                        return <span key={i} className="text-green-500/30">{d.char}</span>;
                      })}
                      {allResolved && <span className="text-green-500 animate-pulse">_</span>}
                      {!allResolved && <span className="inline-block w-3 h-8 bg-green-500 align-middle ml-1 animate-pulse shadow-[0_0_10px_#22c55e]" />}
                    </h2>
                  );
                })()}

                {/* Text lines streaming in */}
                <HackerLine 
                  text={`Hello. I'm Sachin Eldho, a full-stack engineer specializing in bridging AI capabilities and premium, production-ready frontends.`}
                  lineIndex={1}
                  totalLines={8}
                  prefix={<span className="text-green-500 font-bold mr-1">{'> '}</span>}
                />
                <HackerLine 
                  text="I build software that puts AI to work — from RAG pipelines to shipping a complete profit-analytics SaaS."
                  lineIndex={2}
                  totalLines={8}
                  prefix={<span className="text-green-500 font-bold mr-1">{'> '}</span>}
                />
                <HackerLine 
                  text="I architect systems from database models to responsive web and mobile UIs. Clean, optimized code is the goal."
                  lineIndex={3}
                  totalLines={8}
                  prefix={<span className="text-green-500 font-bold mr-1">{'> '}</span>}
                />
                <HackerLine 
                  text="Stack: React, TypeScript, React Native, Python, FastAPI, Supabase, Gemini, Groq, Ollama."
                  lineIndex={4}
                  totalLines={8}
                  prefix={<span className="text-green-500 font-bold mr-1">{'> '}</span>}
                />
                <HackerLine 
                  text="Engineering rigor + design sensibility = tools that look expensive and perform smoothly."
                  lineIndex={5}
                  totalLines={8}
                  prefix={<span className="text-green-500 font-bold mr-1">{'> '}</span>}
                />
                <HackerLine 
                  text="Let's build something exceptional together."
                  lineIndex={6}
                  totalLines={8}
                  prefix={<span className="text-green-500 font-bold mr-1">{'> '}</span>}
                />
              </div>

              {/* Right Side — Target Locked Image (smaller, compact) */}
              <div 
                className="relative w-full max-w-[320px] lg:max-w-[340px] aspect-square flex-shrink-0 mx-auto lg:mx-0 overflow-hidden"
                style={{
                  opacity: imageEased,
                  transform: `scale(${0.88 + imageEased * 0.12}) translate3d(0, ${(1 - imageEased) * 20}px, 0)`,
                  willChange: 'transform, opacity',
                }}
              >
                {/* Rotating outer reticle */}
                <div 
                  className="absolute inset-0 rounded-full border-2 border-green-500/25 m-2 pointer-events-none"
                  style={{ transform: `rotate(${aboutScrollProgress * 90}deg)`, borderStyle: 'dashed' }}
                />
                {/* Inner reticle */}
                <div 
                  className="absolute inset-0 rounded-full border border-green-500/15 m-8 pointer-events-none"
                  style={{ transform: `rotate(${-aboutScrollProgress * 60}deg)`, borderStyle: 'dashed' }}
                />

                {/* Image container */}
                <div className="absolute inset-0 bg-[#080808] border border-slate-800 overflow-hidden group">
                  <img 
                    src="/about-profile.png" 
                    alt="Sachin Eldho" 
                    className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-700" 
                    loading="lazy"
                    decoding="async"
                    style={{
                      opacity: 0.3 + imageEased * 0.5,
                      mixBlendMode: imageEased > 0.8 ? 'normal' : 'luminosity',
                    }}
                  />
                  
                  {/* Scan line */}
                  <div 
                    className="absolute left-0 w-full h-[2px] bg-green-500/60 shadow-[0_0_15px_rgba(34,197,94,0.8)] z-20"
                    style={{ top: `${(aboutScrollProgress * 200) % 100}%` }}
                  />
                  
                  {/* Crosshair */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
                    <div className="w-6 h-[1px] bg-green-500/40" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-6 bg-green-500/40" />
                  </div>

                  {/* HUD overlays */}
                  <div className="absolute top-4 right-4 flex flex-col items-end gap-1 font-mono text-[9px] text-green-500">
                    <span className="bg-black/80 px-1 py-0.5 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full animate-pulse" /> REC
                    </span>
                  </div>
                  <div 
                    className="absolute bottom-4 left-4 font-mono text-[9px] text-green-500"
                    style={{ opacity: imageEased > 0.6 ? 1 : 0, transition: 'opacity 0.4s ease' }}
                  >
                    <span className="bg-black/80 px-1 py-0.5 tracking-widest">TARGET_LOCKED</span>
                  </div>
                  <div 
                    className="absolute bottom-4 right-4 font-mono text-[9px] text-green-500"
                    style={{ opacity: imageEased > 0.8 ? 1 : 0, transition: 'opacity 0.4s ease' }}
                  >
                    <span className="bg-black/80 px-1 py-0.5 tracking-wider">MATCH: 99.7%</span>
                  </div>

                  {/* Corner brackets */}
                  <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-green-500/70" style={{ transform: `scale(${imageEased})`, transformOrigin: 'top left' }} />
                  <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-green-500/70" style={{ transform: `scale(${imageEased})`, transformOrigin: 'top right' }} />
                  <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-green-500/70" style={{ transform: `scale(${imageEased})`, transformOrigin: 'bottom left' }} />
                  <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-green-500/70" style={{ transform: `scale(${imageEased})`, transformOrigin: 'bottom right' }} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* --- CONTACT SECTION --- */}
      <section id="contact" className="py-16 md:py-24 px-6 bg-[#050505]">
        <div className="max-w-6xl mx-auto">
            <h2 className="text-6xl md:text-8xl font-black text-white mb-2 tracking-tighter flex items-center gap-4">
                CONTACT <span className="text-green-500 animate-pulse">{'>'}_</span>
            </h2>
            <p className="text-slate-400 text-lg font-mono mb-16 uppercase tracking-wider pl-2 border-l-2 border-green-500/50">
                Let's connect. Execute command: send message.
            </p>

            <div className="grid md:grid-cols-2 gap-20">
                
                {/* Form */}
                <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-6 font-mono">
                        <div className="relative group">
                            <label className="text-xs text-green-500 font-bold uppercase tracking-widest mb-2 block">Name:</label>
                            <div className="relative flex items-center border border-slate-800 bg-[#080808] focus-within:border-green-500 transition-colors">
                                <span className="pl-4 text-slate-600">|</span>
                                <input 
                                    type="text" 
                                    className="w-full bg-transparent border-none p-4 text-slate-200 focus:ring-0 focus:outline-none placeholder-slate-700"
                                    placeholder=""
                                />
                            </div>
                        </div>
                        
                        <div className="relative group">
                            <label className="text-xs text-green-500 font-bold uppercase tracking-widest mb-2 block">Email:</label>
                             <div className="relative flex items-center border border-slate-800 bg-[#080808] focus-within:border-green-500 transition-colors">
                                <span className="pl-4 text-slate-600">@</span>
                                <input
                                    type="email"
                                    className="w-full bg-transparent border-none p-4 text-slate-200 focus:ring-0 focus:outline-none placeholder-slate-700"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="text-xs text-green-500 font-bold uppercase tracking-widest mb-2 block">Subject:</label>
                            <div className="relative flex items-center border border-slate-800 bg-[#080808] focus-within:border-green-500 transition-colors">
                                <span className="pl-4 text-slate-600 text-xs">Re:</span>
                                <input 
                                    type="text" 
                                    className="w-full bg-transparent border-none p-4 text-slate-200 focus:ring-0 focus:outline-none placeholder-slate-700"
                                    placeholder="Project_Inquiry"
                                />
                            </div>
                        </div>

                        <div className="relative group">
                            <label className="text-xs text-green-500 font-bold uppercase tracking-widest mb-2 block">Message:</label>
                            <textarea 
                                rows={5}
                                className="w-full bg-[#080808] border border-slate-800 p-4 text-slate-200 focus:border-green-500 focus:ring-0 focus:outline-none transition-all placeholder-slate-700 resize-none"
                            />
                        </div>
                    </div>

                    <button className="w-fit px-8 py-4 bg-green-500/10 border border-green-500 text-green-400 font-bold tracking-[0.2em] uppercase hover:bg-green-500 hover:text-black active:scale-[0.97] transition-all duration-300 flex items-center gap-4 group rounded-sm">
                        SEND TRANSMISSION <span className="group-hover:translate-x-1 transition-transform">{'>'}</span>
                    </button>
                </form>

                {/* Direct Channel Info */}
                <div className="space-y-16 pt-8 font-mono">
                    <div>
                        <h3 className="text-xl text-green-500 font-bold mb-8 tracking-wider uppercase">DIRECT_CHANNEL:</h3>
                        <div className="space-y-6 text-sm">
                            <div className="flex flex-col gap-2">
                                <span className="text-slate-500 uppercase text-xs tracking-widest">Email:</span>
                                <a href={`mailto:${CONTACT_EMAIL}`} className="text-white hover:text-green-400 transition-colors border-b border-slate-800 pb-1 w-fit">
                                    {CONTACT_EMAIL}
                                </a>
                            </div>
                            <div className="flex flex-col gap-2">
                                <span className="text-slate-500 uppercase text-xs tracking-widest">Status:</span>
                                <span className="text-white flex items-center gap-2">
                                    OPEN_TO_OPPORTUNITIES <GlobeIcon />
                                </span>
                            </div>
                        </div>
                    </div>

                    <div>
                         <h3 className="text-xl text-green-500 font-bold mb-8 tracking-wider uppercase">SOCIAL_LINKS:</h3>
                         <div className="flex flex-col gap-4">
                            {SOCIAL_LINKS.map((link) => (
                                <a 
                                    key={link.platform} 
                                    href={`https://${link.url}`} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="flex items-center gap-3 text-slate-400 hover:text-green-400 transition-colors group"
                                >
                                    <div className="text-green-500/50 group-hover:text-green-500 transition-colors">
                                        {getIcon(link.icon)}
                                    </div>
                                    <span className="text-sm">{link.url}</span>
                                </a>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#050505] text-center relative z-10 border-t border-slate-900 font-mono">
        <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2">
            © 2026 SACHIN ELDHO // ALL RIGHTS RESERVED // TERMINAL ACCESS GRANTED
        </div>
        <div className="text-[8px] text-green-900/50 break-all px-6 max-w-4xl mx-auto">
            8E_NG_SAM_oj Allva_HaNa_Lio_ Npd_VdKpc__ COIZYqcobir_cK, HwpRG_codeid_MAQHjekv0ppfIc_8_pmBvazz2vm70Hkv8pj_t6ALF T0mN u_FJYAZ07BQIQ U7hj
        </div>
      </footer>
    </div>
  );
};

// Helper for icons
const GlobeIcon = () => (
    <span className="animate-spin inline-block ml-2 opacity-50">🌐</span>
);

const getIcon = (name: string) => {
    switch(name) {
        case 'github': return <Github className="w-4 h-4" />;
        case 'linkedin': return <Linkedin className="w-4 h-4" />;
        case 'twitter': return <Twitter className="w-4 h-4" />;
        default: return <div className="w-4 h-4" />;
    }
};

export default Home;