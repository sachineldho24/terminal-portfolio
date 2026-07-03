import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PROJECTS, SOCIAL_LINKS, CONTACT_EMAIL } from '../constants';
import TypingText from '../components/TypingText';
import ProjectListItem from '../components/ProjectListItem';
import PointillismHero from '../components/PointillismHero';
import Preloader from '../components/Preloader';
import { Project } from '../types';
import { MapPin, Mail, Send, Github, Linkedin, Twitter, Terminal, Cpu } from 'lucide-react';

const Home: React.FC = () => {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [systemReady, setSystemReady] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Contact Nano Form state
  const [nanoForm, setNanoForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [nanoStatus, setNanoStatus] = useState('[ Read 22 lines ]');
  const [nanoSending, setNanoSending] = useState(false);
  const [nanoModified, setNanoModified] = useState(false);

  // Contact section scroll-reveal state
  const contactRef = useRef<HTMLElement>(null);
  const [contactVisible, setContactVisible] = useState(false);
  const [isScreenshotMode, setIsScreenshotMode] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isTall = window.innerHeight > 2200;
      setIsScreenshotMode(isTall);
      if (isTall) {
        setContactVisible(true);
      }
    }
  }, []);

  useEffect(() => {
    if (isScreenshotMode) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setContactVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (contactRef.current) {
      observer.observe(contactRef.current);
    }
    return () => observer.disconnect();
  }, [isScreenshotMode]);

  const handleInputChange = (field: keyof typeof nanoForm) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setNanoForm(prev => ({ ...prev, [field]: e.target.value }));
    setNanoModified(true);
  };

  const handleNanoSubmit = useCallback(async () => {
    if (nanoSending) return;
    if (!nanoForm.name.trim() || !nanoForm.email.trim() || !nanoForm.message.trim()) {
      setNanoStatus('[ Error: Name, Email and Message are required! ]');
      setTimeout(() => {
        setNanoStatus(nanoModified ? '[ Modified ]' : '[ Read 22 lines ]');
      }, 3000);
      return;
    }

    setNanoSending(true);
    setNanoStatus('[ Writing contact.txt ... ]');
    
    await new Promise((r) => setTimeout(r, 800));
    setNanoStatus('[ Committing file change ... ]');
    
    await new Promise((r) => setTimeout(r, 800));
    setNanoStatus('[ Transmitting SMTP payload ... ]');

    await new Promise((r) => setTimeout(r, 1000));

    setNanoStatus('[ Success: 200 OK. Message sent! ]');
    setNanoForm({ name: '', email: '', subject: '', message: '' });
    setNanoModified(false);
    setNanoSending(false);

    setTimeout(() => {
      setNanoStatus('[ Read 22 lines ]');
    }, 5000);
  }, [nanoForm, nanoSending, nanoModified]);

  const handleShortcutClick = useCallback((cmd: string) => {
    if (nanoSending) return;
    switch (cmd) {
      case 'help':
        setNanoStatus('[ Help: Edit fields directly, type Ctrl+X or click ^X to transmit message. ]');
        setTimeout(() => setNanoStatus(nanoModified ? '[ Modified ]' : '[ Read 22 lines ]'), 5000);
        break;
      case 'write':
        handleNanoSubmit();
        break;
      case 'read':
        setNanoForm({ name: '', email: '', subject: '', message: '' });
        setNanoModified(false);
        setNanoStatus('[ Reset template: contact.txt ]');
        setTimeout(() => setNanoStatus('[ Read 22 lines ]'), 3000);
        break;
      case 'page':
        setNanoStatus('[ Page 1 of 1 (contact.txt) ]');
        setTimeout(() => setNanoStatus(nanoModified ? '[ Modified ]' : '[ Read 22 lines ]'), 3000);
        break;
      case 'cut':
        setNanoForm(prev => ({ ...prev, message: '' }));
        setNanoStatus('[ Cut message text buffer ]');
        setTimeout(() => setNanoStatus(nanoModified ? '[ Modified ]' : '[ Read 22 lines ]'), 3000);
        break;
      case 'pos':
        setNanoStatus('[ Line 12, Column 32, Character 248 ]');
        setTimeout(() => setNanoStatus(nanoModified ? '[ Modified ]' : '[ Read 22 lines ]'), 3000);
        break;
      default:
        break;
    }
  }, [handleNanoSubmit, nanoSending, nanoModified]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === 'x') {
        e.preventDefault();
        handleNanoSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNanoSubmit]);
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

      if (isScreenshotMode) {
        setScrollProgress(1);
        setSkillsScrollProgress(1);
        setAboutScrollProgress(1);
        return;
      }

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
  }, [isDesktop, isScreenshotMode]);

  // Scroll stack effect for projects cards (mutates style directly for 60fps performance)
  useEffect(() => {
    if (isScreenshotMode) return;

    let ticking = false;

    const updateCardEffects = () => {
      ticking = false;
      const topThreshold = 110;
      
      PROJECTS.forEach((_, idx) => {
        const card = cardRefs.current[idx];
        if (!card) return;

        const nextCard = cardRefs.current[idx + 1];
        if (nextCard) {
          const rectNext = nextCard.getBoundingClientRect();
          const scrollRange = window.innerHeight - topThreshold;
          
          // Calculate coverage as the next card scrolls up on top of this one
          const progress = Math.max(0, Math.min(1, (window.innerHeight - rectNext.top) / scrollRange));
          
          const scale = 1 - progress * 0.05;
          const opacity = 1 - progress * 0.45;
          const yOffset = -progress * 15;

          card.style.transform = `scale(${scale}) translate3d(0, ${yOffset}px, 0)`;
          card.style.opacity = `${opacity}`;
        } else {
          card.style.transform = `scale(1) translate3d(0, 0, 0)`;
          card.style.opacity = `1`;
        }
      });

      // Update crossing marquee translations on scroll
      const ltrMarquee = document.getElementById('marquee-ltr');
      const rtlMarquee = document.getElementById('marquee-rtl');
      if (ltrMarquee) {
        const offset = (window.scrollY * 0.22) % 1200;
        ltrMarquee.style.transform = `translate3d(${offset - 300}px, 0, 0)`;
      }
      if (rtlMarquee) {
        const offset = (window.scrollY * 0.22) % 1200;
        rtlMarquee.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateCardEffects);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateCardEffects();
    return () => window.removeEventListener('scroll', onScroll);
  }, [isScreenshotMode]);

  // Intersection observer for image clip-path reveals (Emil Kowalski entrance principle)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

    const elements = document.querySelectorAll('.project-image-mask');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, []);

  // Magnetic button handlers (Emil Kowalski physical micro-interaction principle)
  const handleMagneticMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const btn = e.currentTarget;
    const { left, top, width, height } = btn.getBoundingClientRect();
    const x = e.clientX - left - width / 2;
    const y = e.clientY - top - height / 2;
    const dist = Math.sqrt(x * x + y * y);
    const maxDist = Math.max(width, height) * 0.8;
    if (dist < maxDist) {
      btn.style.transform = `translate3d(${x * 0.35}px, ${y * 0.35}px, 0) scale(1.03)`;
    }
  };

  const handleMagneticLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const btn = e.currentTarget;
    btn.style.transform = 'translate3d(0, 0, 0) scale(1)';
  };

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

  // 3D Tilt state & handlers for skills cards
  const [tiltStyles, setTiltStyles] = useState<{ [key: number]: string }>({});

  const handleTiltMove = (index: number, e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDesktop) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    
    const dx = x - xc;
    const dy = y - yc;
    
    // Rotate max ±10 degrees
    const rx = -(dy / yc) * 10;
    const ry = (dx / xc) * 10;
    
    setTiltStyles(prev => ({
      ...prev,
      [index]: `rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.02, 1.02, 1.02)`
    }));
  };

  const handleTiltLeave = (index: number) => {
    setTiltStyles(prev => ({
      ...prev,
      [index]: 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)'
    }));
  };

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
  const HackerLine = useCallback(({ text, lineIndex, totalLines }: { text: string; lineIndex: number; totalLines: number }) => {
    const visible = isLineVisible(lineIndex, totalLines);
    if (!visible) return null; // don't render anything until line's scroll zone starts
    const decoded = decryptLine(text, lineIndex, totalLines);
    const allResolved = decoded.every(d => d.resolved);

    return (
      <div className="font-mono text-sm md:text-base leading-relaxed mb-4 flex items-start">
        <div className="flex-shrink-0 select-none mr-2.5 text-green-500 font-bold">{'>'}</div>
        <div className="flex-1">
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
      transform: `translate3d(${currentX}px, ${currentY}px, ${zOffset}px) rotateZ(${currentAngle}deg) ${p > 0.85 && tiltStyles[index] ? tiltStyles[index] : ''}`,
      // Smooth out transitions when scrolling, but speed up for responsive hover tilt when assembled
      transition: p > 0.85 
        ? 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), border-color 0.3s ease, box-shadow 0.3s ease'
        : 'transform 0.8s cubic-bezier(0.1, 0.8, 0.2, 1), border-color 0.3s ease, box-shadow 0.3s ease',
      zIndex: p > 0.35 + index * 0.08 ? 20 + index : 10 - index,
      transformStyle: 'preserve-3d' as const,
      boxShadow: p > 0.35 
        ? '0 10px 30px -10px rgba(34, 197, 94, 0.15), 0 0 1px 1px rgba(34, 197, 94, 0.1)' 
        : '0 25px 50px -15px rgba(0, 0, 0, 0.95), 0 0 1px 1px rgba(34, 197, 94, 0.15)',
    };
  };

  return (
    <div className="min-h-screen font-mono bg-[#050505] text-slate-300">
      <Preloader />

      {/* --- HERO SECTION WITH POINTILLISM PORTRAIT --- */}
      {/* This tall wrapper provides the scroll distance that drives the animation */}
      <div id="home" ref={heroWrapperRef} style={{ height: isScreenshotMode ? 'auto' : '250vh' }}>
        <section className={`${isScreenshotMode ? 'relative min-h-[100vh]' : 'sticky top-0 min-h-[100dvh] lg:h-[100dvh]'} flex flex-col px-4 sm:px-6 relative overflow-hidden`}>
          
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
          <div className="max-w-[1400px] mx-auto w-full z-10 flex-1 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10 pt-20 sm:pt-24 px-6 sm:px-10 lg:px-16">
              
              {/* LEFT: Text content (more compact, shifted upwards) */}
              <div className="w-full lg:w-[46%] lg:pl-8 flex-shrink-0 flex flex-col justify-center min-w-0 pt-0 lg:pt-2 lg:-mt-12">
                  <div className="mb-6 sm:mb-8">
                      <div className="h-[30px] sm:h-[48px] md:h-[60px] lg:h-[72px] xl:h-[96px] text-[#f1eae1] mb-1 relative z-10 flex items-center">
                          <svg 
                            viewBox="0 0 256 176" 
                            className="h-[80%] w-auto"
                            fill="currentColor"
                          >
                              <path d="M147.486878,0 C147.486878,0 217.568251,175.780074 217.568251,175.780074 C217.568251,175.780074 256,175.780074 256,175.780074 C256,175.780074 185.918621,0 185.918621,0 C185.918621,0 147.486878,0 147.486878,0 C147.486878,0 147.486878,0 147.486878,0 Z"></path>
                              <path d="M66.1828124,106.221191 C66.1828124,106.221191 90.1624677,44.4471185 90.1624677,44.4471185 C90.1624677,44.4471185 114.142128,106.221191 114.142128,106.221191 C114.142128,106.221191 66.1828124,106.221191 66.1828124,106.221191 C66.1828124,106.221191 66.1828124,106.221191 66.1828124,106.221191 Z M70.0705318,0 C70.0705318,0 0,175.780074 0,175.780074 C0,175.780074 39.179211,175.780074 39.179211,175.780074 C39.179211,175.780074 53.5097704,138.86606 53.5097704,138.86606 C53.5097704,138.86606 126.817544,138.86606 126.817544,138.86606 C126.817544,138.86606 141.145724,175.780074 141.145724,175.780074 C141.145724,175.780074 180.324935,175.780074 180.324935,175.780074 C180.324935,175.780074 110.254409,0 110.254409,0 C110.254409,0 70.0705318,0 70.0705318,0 C70.0705318,0 70.0705318,0 70.0705318,0 Z"></path>
                          </svg>
                      </div>
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
        ref={isDesktop && !isScreenshotMode ? skillsWrapperRef : null} 
        className={isDesktop && !isScreenshotMode ? "relative h-[220vh] bg-[#050505]" : "relative bg-[#050505] py-16 md:py-24"}
      >
        <section 
          className={isDesktop && !isScreenshotMode 
            ? "sticky top-0 h-[100dvh] flex flex-col justify-center px-4 sm:px-6 relative overflow-hidden"
            : "px-4 sm:px-6 relative"
          }
        >
          <div className="max-w-[1400px] mx-auto w-full font-mono px-6 sm:px-10 lg:px-16">
            <div className="flex flex-col lg:flex-row items-stretch justify-between gap-10">
              
              {/* Left Column (Desktop Title) */}
              <div className="hidden lg:flex w-full lg:w-[30%] lg:pl-8 flex-shrink-0 flex-col justify-center pr-4">
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
                          onMouseMove={(e) => handleTiltMove(0, e)}
                          onMouseLeave={() => handleTiltLeave(0)}
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
                          onMouseMove={(e) => handleTiltMove(1, e)}
                          onMouseLeave={() => handleTiltLeave(1)}
                          className="border border-green-500/20 bg-[#070707] rounded-lg p-5 pb-4 hover:border-green-500/40 transition-all duration-300 overflow-hidden flex flex-col"
                      >
                          <h3 className="text-green-500 text-sm md:text-base font-bold uppercase tracking-wider mb-2 flex items-center gap-2 flex-shrink-0">
                              <span>{'>'}</span> 2. BACKEND
                          </h3>
                          <div className="flex-1 flex items-center justify-center">
                              <div className="grid grid-cols-3 gap-y-4 gap-x-3 justify-items-center text-center items-center w-full">
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
                              </div>
                          </div>
                      </div>

                      {/* 3. AI/ML */}
                      <div 
                          style={getCardStyle(2)}
                          onMouseMove={(e) => handleTiltMove(2, e)}
                          onMouseLeave={() => handleTiltLeave(2)}
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
                          onMouseMove={(e) => handleTiltMove(3, e)}
                          onMouseLeave={() => handleTiltLeave(3)}
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
                          onMouseMove={(e) => handleTiltMove(4, e)}
                          onMouseLeave={() => handleTiltLeave(4)}
                          className="border border-green-500/20 bg-[#070707] rounded-lg p-5 pb-3 hover:border-green-500/40 transition-all duration-300 overflow-hidden flex flex-col"
                      >
                          <h3 className="text-green-500 text-sm md:text-base font-bold uppercase tracking-wider mb-2 flex items-center gap-2 flex-shrink-0">
                              <span>{'>'}</span> 5. DATABASES & VECTOR DB
                          </h3>
                          <div className="flex-1 flex items-center justify-center">
                              <div className="grid grid-cols-3 gap-y-4 gap-x-2 w-full justify-items-center mt-1">
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
                                  {/* Supabase */}
                                  <div className="flex flex-col items-center gap-2 group cursor-pointer">
                                      <img src="/SVG_ICONS/devicon--supabase.svg" className="w-10 h-10 sm:w-12 sm:h-12 transition-transform duration-500 cubic-bezier(0.175, 0.885, 0.32, 1.275) group-hover:scale-125" alt="Supabase" />
                                      <span className="text-[10px] sm:text-xs md:text-[13px] text-slate-400 group-hover:text-white transition-colors duration-200">Supabase</span>
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
                          onMouseMove={(e) => handleTiltMove(5, e)}
                          onMouseLeave={() => handleTiltLeave(5)}
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
      <section id="projects" className="pt-8 md:pt-12 pb-20 relative bg-[#050505]" ref={projectsRef}>
        
        {/* Scroll-driven Crossing Marquees Divider */}
        <div className="w-full overflow-hidden border-y border-green-950/20 py-8 my-16 relative bg-[#050505] select-none font-mono">
            <div 
                id="marquee-ltr"
                className="whitespace-nowrap text-[clamp(24px,3.5vw,56px)] font-black text-green-500/20 uppercase tracking-widest transition-transform duration-300 ease-out"
                style={{ willChange: 'transform' }}
            >
                DEPLOYED_SYSTEMS // FULL_STACK_CAPABILITY // DECISION_ENGINE // AGENTIC_ROUTING // 
            </div>
            <div 
                id="marquee-rtl"
                className="whitespace-nowrap text-[clamp(24px,3.5vw,56px)] font-black text-slate-800 uppercase tracking-widest transition-transform duration-300 ease-out mt-4"
                style={{ willChange: 'transform' }}
            >
                ◄◄ PIPELINES // VECTOR_DATABASES // SYSTEM_READY // INTUITIVE_INTERFACES // 
            </div>
        </div>

        <div className="max-w-[1400px] mx-auto w-full px-6 sm:px-10 lg:px-16 font-mono">
            <div className="lg:pl-8">
            {/* Title */}
            <div className="mb-10">
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-3 uppercase">
                    PROJECTS<span className="text-green-500 animate-pulse">_</span>
                </h2>
                <p className="text-slate-400 text-sm sm:text-base">Selected systems, applications, and source code.</p>
            </div>

            {/* Custom Embedded CSS Styles for Scanline and Mask Reveals */}
            <style>{`
              .project-image-mask {
                clip-path: inset(100% 0 0 0);
                transition: clip-path 1.2s cubic-bezier(0.23, 1, 0.32, 1);
              }
              .project-image-mask.revealed {
                clip-path: inset(0% 0 0 0);
              }
              
              @keyframes crt-scan-sweep {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(330%); }
              }
              
              .card-scanline {
                position: absolute;
                inset: 0;
                background: linear-gradient(
                  to bottom,
                  transparent 0%,
                  rgba(34, 197, 94, 0.03) 10%,
                  rgba(34, 197, 94, 0.08) 50%,
                  rgba(34, 197, 94, 0.03) 90%,
                  transparent 100%
                );
                height: 30%;
                width: 100%;
                pointer-events: none;
                z-index: 5;
                animation: crt-scan-sweep 8s linear infinite;
              }
            `}</style>

            {/* Sticky Stack Card Deck */}
            <div className="space-y-16 mt-12 relative pb-10">
                {PROJECTS.map((project, idx) => {
                    return (
                        <div 
                            key={project.id}
                            ref={el => cardRefs.current[idx] = el}
                            className="sticky bg-[#0a0a0a]/95 border border-green-500/20 rounded-lg shadow-[0_0_50px_rgba(34,197,94,0.02)] overflow-hidden origin-top"
                            style={{
                                top: `${110 + idx * 24}px`, // Stack offset so header tabs remain visible!
                                minHeight: '440px',
                                transition: 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1), opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                                willChange: 'transform, opacity',
                            }}
                        >
                            {/* Cathode-ray beam scanning line overlay */}
                            <div className="card-scanline" />

                            {/* Card Header tab */}
                            <div className="bg-[#121212] px-4 py-2 flex justify-between items-center border-b border-green-950/40 text-xs font-bold text-slate-400">
                                <div className="flex items-center gap-2">
                                    <span className="text-green-500">{'>'}</span>
                                    <span>SYSTEM_LOG: {project.name}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-green-500/80">SIZE: {project.size}KB</span>
                                    <span className={`px-1.5 py-0.5 rounded-sm ${project.status === 'DEPLOYED' ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                                        {project.status}
                                    </span>
                                </div>
                            </div>

                            {/* Card Content Grid */}
                            <div className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[380px]">
                                {/* Left Side: Details */}
                                <div className="space-y-4 flex flex-col justify-between h-full">
                                    <div className="space-y-4">
                                        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-wide uppercase">
                                            {project.name} <span className="text-green-500/60 font-normal text-xs ml-2">[{project.date}]</span>
                                        </h3>
                                        
                                        <div className="border border-green-500/10 rounded bg-[#030303] p-4 font-mono text-xs sm:text-sm text-green-500/90 max-h-[160px] overflow-y-auto leading-relaxed shadow-[inset_0_0_12px_rgba(0,255,0,0.01)]">
                                            <div className="text-green-400 font-bold mb-1 select-none">// DESCRIPTION_LOG:</div>
                                            {project.fullDescription}
                                        </div>

                                        <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs">
                                            {project.technologies.map((tech, i) => (
                                                <span key={i} className="text-green-500/80 bg-green-500/5 px-2 py-0.5 border border-green-500/10 rounded-sm">
                                                    {tech}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Action Links with Magnetic Pull */}
                                    <div className="flex flex-wrap gap-4 pt-4">
                                        {project.demoLink && (
                                            <a 
                                                href={project.demoLink} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                onMouseMove={handleMagneticMove}
                                                onMouseLeave={handleMagneticLeave}
                                                className="px-4 py-2.5 bg-green-500 text-black font-bold tracking-wider text-xs flex items-center gap-1.5 active:scale-[0.97] rounded-sm"
                                                style={{ transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), background-color 200ms ease' }}
                                            >
                                                <span>$</span> RUN_LIVE_DEMO
                                            </a>
                                        )}
                                        {project.repoLink && (
                                            <a 
                                                href={project.repoLink} 
                                                target="_blank" 
                                                rel="noreferrer" 
                                                onMouseMove={handleMagneticMove}
                                                onMouseLeave={handleMagneticLeave}
                                                className="px-4 py-2.5 border border-green-500/30 text-green-400 font-bold tracking-wider text-xs flex items-center gap-1.5 active:scale-[0.97] rounded-sm"
                                                style={{ transition: 'transform 0.4s cubic-bezier(0.23, 1, 0.32, 1), border-color 200ms ease, color 200ms ease' }}
                                            >
                                                <span>$</span> VIEW_SOURCE
                                            </a>
                                        )}
                                    </div>
                                </div>

                                {/* Right Side: Visual Image Preview (with clip-path mask-lift reveal) */}
                                <div className="relative aspect-[16/10] bg-black border border-green-950/30 overflow-hidden group rounded-sm shadow-inner project-image-mask">
                                    {/* Primary Image Cover */}
                                    <img 
                                        src={project.image} 
                                        alt={project.name} 
                                        className="w-full h-full object-cover opacity-80 group-hover:opacity-20 group-hover:blur-md transition-all duration-500" 
                                        loading="lazy"
                                        decoding="async"
                                        style={{ transition: 'opacity 400ms ease, filter 400ms ease' }}
                                    />

                                    {/* Secondary Hover Letterbox (ItsJay style polygon reveal showcasing project gallery) */}
                                    {project.gallery && project.gallery[0] && (
                                        <div 
                                            className="absolute top-1/2 -translate-y-[8%] left-1/2 -translate-x-1/2 w-[75%] aspect-video rounded border border-green-500/20 overflow-hidden z-20 transition-all duration-700
                                              [clip-path:polygon(30%_50%,70%_50%,70%_50%,30%_50%)]
                                              group-hover:[clip-path:polygon(0_100%,100%_100%,100%_0,0_0)]
                                              group-hover:-translate-y-1/2"
                                            style={{ transitionTimingFunction: 'cubic-bezier(0.87, 0, 0.13, 1)' }}
                                        >
                                            <img 
                                                src={project.gallery[0]} 
                                                alt={`${project.name} secondary detail`}
                                                className="w-full h-full object-cover scale-110 group-hover:scale-100 transition-all duration-700" 
                                                style={{ transitionTimingFunction: 'cubic-bezier(0.23, 1, 0.32, 1)' }}
                                            />
                                            {/* Corner brackets overlay */}
                                            <div className="absolute top-2 left-2 w-2 h-2 border-t border-l border-green-500/60" />
                                            <div className="absolute top-2 right-2 w-2 h-2 border-t border-r border-green-500/60" />
                                            <div className="absolute bottom-2 left-2 w-2 h-2 border-b border-l border-green-500/60" />
                                            <div className="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-green-500/60" />
                                        </div>
                                    )}

                                    {/* CRT scanline simulation on image */}
                                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.15)_50%)] bg-[length:100%_4px] pointer-events-none z-10" />
                                    
                                    {/* Decorative HUD lines */}
                                    <div className="absolute top-2 left-2 text-[8px] bg-black/80 text-green-500/80 px-1 font-bold z-20">
                                        PREVIEW_01 // RESOLVED
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            </div>
        </div>
      </section>

      {/* --- ABOUT SECTION (Scroll-Pinned — Hacker Decryption Reveal) --- */}
      <div 
        id="about" 
        ref={isScreenshotMode ? null : aboutWrapperRef} 
        className="relative bg-[#050505]"
        style={{ height: isScreenshotMode ? 'auto' : '180vh' }}
      >
        <section 
          ref={aboutRef}
          className={`${isScreenshotMode ? 'relative h-auto py-16 md:py-24' : 'sticky top-0 h-[100dvh]'} flex flex-col justify-center px-6 overflow-hidden pt-20`}
        >
          <div className="max-w-[1400px] mx-auto w-full px-6 sm:px-10 lg:px-16">
            {/* Top bar — terminal-style */}
            <div 
              className="flex items-center gap-2 text-xs font-mono text-slate-500 mb-6 lg:pl-8"
              style={{ opacity: aboutScrollProgress > 0 ? 1 : 0 }}
            >
              <span className="text-green-500">{'>'}</span>
              <span className="text-slate-400">decrypting ./about_me.dat</span>
              <span className="text-green-500/60 ml-2">[{Math.min(100, Math.round(aboutScrollProgress * 130))}%]</span>
              {aboutScrollProgress < 0.77 && <span className="w-1.5 h-4 bg-green-500 inline-block animate-pulse shadow-[0_0_6px_#22c55e]" />}
            </div>

            <div className="flex flex-col lg:flex-row gap-10 lg:gap-16 items-start">
              {/* Left Column: Hacker text streaming */}
              <div className="flex-1 min-w-0 lg:pl-8">
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
                />
                <HackerLine 
                  text="I build software that puts AI to work — from RAG pipelines to shipping a complete profit-analytics SaaS."
                  lineIndex={2}
                  totalLines={8}
                />
                <HackerLine 
                  text="I architect systems from database models to responsive web and mobile UIs. Clean, optimized code is the goal."
                  lineIndex={3}
                  totalLines={8}
                />
                <HackerLine 
                  text="Stack: React, TypeScript, React Native, Python, FastAPI, Supabase, Gemini, Groq, Ollama."
                  lineIndex={4}
                  totalLines={8}
                />
                <HackerLine 
                  text="Engineering rigor + design sensibility = tools that look expensive and perform smoothly."
                  lineIndex={5}
                  totalLines={8}
                />
                <HackerLine 
                  text="Let's build something exceptional together."
                  lineIndex={6}
                  totalLines={8}
                />
              </div>
 
              {/* Right Side — Target Locked Image (enlarged to align bottom) */}
              <div 
                className="relative w-full max-w-[320px] lg:max-w-[420px] aspect-square flex-shrink-0 mx-auto lg:mx-0 overflow-hidden"
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
      <section id="contact" ref={contactRef} className="py-16 md:py-24 bg-[#050505] overflow-hidden">
        <div className={`max-w-[1400px] mx-auto w-full px-6 sm:px-10 lg:px-16 transition-all duration-1000 ease-out transform ${
            contactVisible 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-12 scale-98 pointer-events-none'
        }`}>
            <div className="lg:pl-8">
                <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tighter mb-3 uppercase font-mono">
                    CONTACT
                </h2>
                <p className="text-slate-400 text-base sm:text-lg font-mono mb-6 uppercase tracking-wider pl-2 border-l-2 border-green-500/50 select-none">
                    Let's connect. Execute command: send message.
                </p>

                <div className="border border-green-500/20 bg-[#020202] rounded overflow-hidden shadow-[0_0_30px_rgba(34,197,94,0.05)] w-full">
                {/* Nano Header Bar */}
                <div className="bg-green-500 text-black font-mono text-xs px-4 py-1.5 flex justify-between font-bold select-none">
                    <span>GNU nano 7.2</span>
                    <span>contact.txt</span>
                    <span>{nanoModified ? 'Modified' : ''}</span>
                </div>

                {/* Nano Editor Container */}
                <div className="flex bg-black font-mono text-xs sm:text-sm p-4 text-green-500/90 relative min-h-[440px] w-full">
                    {/* Line numbers (1 to 22) - hidden on small screens for mobile responsiveness */}
                    <div className="hidden sm:flex text-green-900/40 select-none pr-3 border-r border-green-950/20 text-right w-8 flex-shrink-0 flex-col gap-1.5">
                        {Array.from({ length: 22 }, (_, i) => (
                            <div key={i + 1} className="h-6 flex items-center justify-end">{i + 1}</div>
                        ))}
                    </div>

                    {/* Workspace */}
                    <div className="flex-1 pl-0 sm:pl-4 flex flex-col gap-1.5 w-full min-w-0">
                        <div className="h-6 flex items-center text-green-900/60 select-none overflow-hidden whitespace-nowrap"># ====================================================</div>
                        <div className="h-6 flex items-center text-green-400 font-bold select-none overflow-hidden whitespace-nowrap">#      LET'S BUILD SOMETHING INTELLIGENT TOGETHER</div>
                        <div className="h-6 flex items-center text-green-900/60 select-none overflow-hidden whitespace-nowrap"># ====================================================</div>
                        <div className="h-6" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch w-full min-w-0">
                            {/* Left Column: Info & Connect */}
                            <div className="space-y-4 min-w-0">
                                {/* Contact Info Panel */}
                                <div className="border border-green-500/20 rounded p-4 space-y-3 bg-[#030303]/60 relative shadow-[inset_0_0_12px_rgba(0,255,0,0.02)] min-w-0">
                                    <div className="text-green-400 font-bold tracking-wide select-none">{'>'} CONTACT INFO</div>
                                    <div className="space-y-2 text-xs sm:text-sm">
                                        <div className="grid grid-cols-[80px_10px_1fr] gap-x-1">
                                            <span className="text-green-500/60 font-semibold">Name</span>
                                            <span className="text-green-500/30">:</span>
                                            <span className="text-white truncate">Sachin Eldho</span>
                                        </div>
                                        <div className="grid grid-cols-[80px_10px_1fr] gap-x-1">
                                            <span className="text-green-500/60 font-semibold">Email</span>
                                            <span className="text-green-500/30">:</span>
                                            <a href={`mailto:${CONTACT_EMAIL}`} className="text-white hover:text-green-400 hover:underline transition-all break-all">{CONTACT_EMAIL}</a>
                                        </div>
                                        <div className="grid grid-cols-[80px_10px_1fr] gap-x-1">
                                            <span className="text-green-500/60 font-semibold">Location</span>
                                            <span className="text-green-500/30">:</span>
                                            <span className="text-white">India</span>
                                        </div>
                                        <div className="grid grid-cols-[80px_10px_1fr] gap-x-1">
                                            <span className="text-green-500/60 font-semibold">Status</span>
                                            <span className="text-green-500/30">:</span>
                                            <span className="text-white flex items-center gap-1.5 truncate">Open to opportunities <GlobeIcon /></span>
                                        </div>
                                    </div>
                                </div>

                                {/* Connect Panel */}
                                <div className="border border-green-500/20 rounded p-4 space-y-2 bg-[#030303]/60 relative shadow-[inset_0_0_12px_rgba(0,255,0,0.02)] min-w-0">
                                    <div className="text-green-400 font-bold tracking-wide select-none">{'>'} CONNECT</div>
                                    <div className="text-green-500/40 text-[10px] select-none">Let's connect on other platforms</div>
                                    <div className="w-full h-[1px] bg-green-500/10 mb-2" />
                                    <div className="space-y-2 text-xs sm:text-sm">
                                        <div className="grid grid-cols-[80px_10px_1fr] gap-x-1">
                                            <span className="text-green-500/60 font-semibold">GitHub</span>
                                            <span className="text-green-500/30">:</span>
                                            <a href="https://github.com/sachineldho24" target="_blank" rel="noreferrer" className="text-white hover:text-green-400 hover:underline transition-all truncate">github.com/sachineldho24</a>
                                        </div>
                                        <div className="grid grid-cols-[80px_10px_1fr] gap-x-1">
                                            <span className="text-green-500/60 font-semibold">LinkedIn</span>
                                            <span className="text-green-500/30">:</span>
                                            <a href="https://linkedin.com/in/sachin-eldho" target="_blank" rel="noreferrer" className="text-white hover:text-green-400 hover:underline transition-all truncate">linkedin.com/in/sachin-eldho</a>
                                        </div>
                                        <div className="grid grid-cols-[80px_10px_1fr] gap-x-1">
                                            <span className="text-green-500/60 font-semibold">X</span>
                                            <span className="text-green-500/30">:</span>
                                            <a href="https://x.com/sachin_eldho24" target="_blank" rel="noreferrer" className="text-white hover:text-green-400 hover:underline transition-all truncate">x.com/sachin_eldho24</a>
                                        </div>
                                        <div className="grid grid-cols-[80px_10px_1fr] gap-x-1">
                                            <span className="text-green-500/60 font-semibold">Instagram</span>
                                            <span className="text-green-500/30">:</span>
                                            <span className="text-slate-500 italic">will be provided later</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Message Form */}
                            <div className="border border-green-500/20 rounded p-4 bg-[#030303]/60 shadow-[inset_0_0_12px_rgba(0,255,0,0.02)] flex flex-col justify-between min-h-[350px] min-w-0">
                                <div className="space-y-4">
                                    <div className="text-green-400 font-bold tracking-wide select-none">{'>'} SEND A MESSAGE</div>
                                    
                                    <div className="space-y-3 font-mono">
                                        <div className="grid grid-cols-[80px_10px_1fr] gap-x-1 items-center">
                                            <label className="text-green-500/70 font-semibold select-none text-xs sm:text-sm">Name</label>
                                            <span className="text-green-500/30">:</span>
                                            <input 
                                              type="text" 
                                              value={nanoForm.name} 
                                              onChange={handleInputChange('name')}
                                              className="bg-transparent border-none border-b border-green-950 text-white font-mono p-0 pb-1 focus:ring-0 focus:outline-none focus:border-b focus:border-green-500 w-full text-xs sm:text-sm"
                                              placeholder="____________________________________"
                                            />
                                        </div>

                                        <div className="grid grid-cols-[80px_10px_1fr] gap-x-1 items-center">
                                            <label className="text-green-500/70 font-semibold select-none text-xs sm:text-sm">Email</label>
                                            <span className="text-green-500/30">:</span>
                                            <input 
                                              type="email" 
                                              value={nanoForm.email} 
                                              onChange={handleInputChange('email')}
                                              className="bg-transparent border-none border-b border-green-950 text-white font-mono p-0 pb-1 focus:ring-0 focus:outline-none focus:border-b focus:border-green-500 w-full text-xs sm:text-sm"
                                              placeholder="____________________________________"
                                            />
                                        </div>

                                        <div className="grid grid-cols-[80px_10px_1fr] gap-x-1 items-center">
                                            <label className="text-green-500/70 font-semibold select-none text-xs sm:text-sm">Subject</label>
                                            <span className="text-green-500/30">:</span>
                                            <input 
                                              type="text" 
                                              value={nanoForm.subject} 
                                              onChange={handleInputChange('subject')}
                                              className="bg-transparent border-none border-b border-green-950 text-white font-mono p-0 pb-1 focus:ring-0 focus:outline-none focus:border-b focus:border-green-500 w-full text-xs sm:text-sm"
                                              placeholder="____________________________________"
                                            />
                                        </div>

                                        <div className="grid grid-cols-[80px_10px_1fr] gap-x-1 items-start">
                                            <label className="text-green-500/70 font-semibold pt-1 select-none text-xs sm:text-sm">Message</label>
                                            <span className="text-green-500/30 pt-1">:</span>
                                            <textarea 
                                              rows={4}
                                              value={nanoForm.message} 
                                              onChange={handleInputChange('message')}
                                              className="bg-transparent border-none border-b border-green-950 text-white font-mono p-0 focus:ring-0 focus:outline-none focus:border-b focus:border-green-500 w-full resize-none leading-relaxed text-xs sm:text-sm"
                                              placeholder="____________________________________"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-center">
                                    <button 
                                      onClick={handleNanoSubmit}
                                      disabled={nanoSending}
                                      className="px-6 py-2 border border-green-500 text-green-400 font-bold font-mono tracking-wider hover:bg-green-500 hover:text-black transition-colors rounded-sm text-xs cursor-pointer select-none active:scale-[0.97] bg-[#050505]"
                                    >
                                        {nanoSending ? '[ SENDING... ]' : '[ Send Message ]'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nano Bottom Status Line */}
                <div className="bg-[#050505] border-t border-green-500/20 py-2 flex justify-center text-xs font-mono font-bold select-none">
                    <span className="bg-green-500 text-black px-4 py-0.5">{nanoStatus}</span>
                </div>

                {/* Keyboard Shortcuts Toolbar */}
                <div className="bg-black border-t border-green-950 py-3 px-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-y-1.5 gap-x-2 text-[10px] sm:text-xs font-mono text-green-500 select-none">
                    <div onClick={() => handleShortcutClick('help')} className="cursor-pointer hover:text-green-300 transition-colors"><span className="bg-green-500/10 text-green-400 font-bold px-1 border border-green-500/20 mr-1.5">^G</span> Get Help</div>
                    <div onClick={() => handleShortcutClick('write')} className="cursor-pointer hover:text-green-300 transition-colors"><span className="bg-green-500/10 text-green-400 font-bold px-1 border border-green-500/20 mr-1.5">^O</span> Write Out</div>
                    <div onClick={() => handleShortcutClick('read')} className="cursor-pointer hover:text-green-300 transition-colors"><span className="bg-green-500/10 text-green-400 font-bold px-1 border border-green-500/20 mr-1.5">^R</span> Read File</div>
                    <div onClick={() => handleShortcutClick('page')} className="cursor-pointer hover:text-green-300 transition-colors"><span className="bg-green-500/10 text-green-400 font-bold px-1 border border-green-500/20 mr-1.5">^Y</span> Prev Page</div>
                    <div onClick={() => handleShortcutClick('cut')} className="cursor-pointer hover:text-green-300 transition-colors"><span className="bg-green-500/10 text-green-400 font-bold px-1 border border-green-500/20 mr-1.5">^K</span> Cut Text</div>
                    <div onClick={() => handleShortcutClick('pos')} className="cursor-pointer hover:text-green-300 transition-colors"><span className="bg-green-500/10 text-green-400 font-bold px-1 border border-green-500/20 mr-1.5">^C</span> Cur Pos</div>
                    <div onClick={handleNanoSubmit} className="cursor-pointer hover:text-green-300 transition-colors"><span className="bg-green-500/20 text-green-400 font-bold px-1 border border-green-500 mr-1.5">^X</span> Exit &amp; Send</div>
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