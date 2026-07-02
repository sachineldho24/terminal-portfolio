import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Terminal, Command } from 'lucide-react';

interface NavbarProps {
    toggleTerminal: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleTerminal }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    if (!isHome) return;

    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        ticking = false;
        const sections = ['home', 'skills', 'projects', 'about', 'contact'];
        
        // Dynamic offset based on window height
        const threshold = window.innerHeight / 3;
        const scrollPosition = window.scrollY + threshold;

        // Special check: if scrolled to the very bottom, contact is active
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 50) {
          setActiveSection('contact');
          return;
        }

        for (const section of sections) {
          const el = document.getElementById(section);
          if (el) {
            const top = el.offsetTop;
            const height = el.offsetHeight;
            if (scrollPosition >= top && scrollPosition < top + height) {
              setActiveSection(section);
              break;
            }
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Trigger initially
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  const scrollToSection = (id: string) => {
    if (!isHome) return; 
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navClass = (isActive: boolean) => 
    `text-sm tracking-wider uppercase hover:text-green-400 transition-colors ${isActive ? 'text-green-500 font-bold border-b border-green-500' : 'text-slate-400'}`;

  return (
    <nav className="fixed top-0 left-0 w-full z-40 bg-slate-950/80 backdrop-blur-sm border-b border-green-900/30">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
        {/* Left Side Logo & Brand (aligned in one single line) */}
        <div className="flex items-center gap-2 group cursor-default">
          <Terminal className="w-6 h-6 text-green-500 group-hover:animate-pulse shrink-0" />
          <div className="flex items-baseline gap-2 font-mono">
            <span className="text-xl font-bold text-white tracking-tighter shrink-0">S<span className="text-green-500">≡</span></span>
            <span className="text-[10px] sm:text-[11px] text-green-500/80 font-bold tracking-wider whitespace-nowrap">SACHIN_ELDHO // AI_DEVELOPER</span>
          </div>
        </div>

        {/* Right Side Links & Actions */}
        <div className="flex items-center gap-8">
            <div className="hidden md:flex gap-8">
                {isHome ? (
                    <>
                    <button onClick={() => scrollToSection('home')} className={navClass(activeSection === 'home')}>Home</button>
                    <button onClick={() => scrollToSection('skills')} className={navClass(activeSection === 'skills')}>Skills</button>
                    <button onClick={() => scrollToSection('projects')} className={navClass(activeSection === 'projects')}>Projects</button>
                    <button onClick={() => scrollToSection('about')} className={navClass(activeSection === 'about')}>About</button>
                    <button onClick={() => scrollToSection('contact')} className={navClass(activeSection === 'contact')}>Contact</button>
                    </>
                ) : (
                    <>
                    <NavLink to="/" className={navClass(false)}>Home</NavLink>
                    <NavLink to="/" className={navClass(false)}>Return_Root</NavLink>
                    </>
                )}
            </div>
            
            {/* Terminal Toggle Button */}
            <button 
                onClick={toggleTerminal}
                className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-sm text-green-400 text-xs hover:bg-green-500 hover:text-black active:scale-[0.97] transition-all group"
                title="Open Terminal (Ctrl+`)"
            >
                <Command className="w-3 h-3" />
                <span className="font-mono font-bold tracking-wider hidden sm:inline">TERMINAL</span>
            </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
