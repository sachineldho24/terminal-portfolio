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

  const renderNavLink = (id: string, label: string) => {
    const isActive = activeSection === id;
    return (
      <button 
        onClick={() => scrollToSection(id)} 
        className={`text-xs tracking-widest uppercase font-mono flex items-center active:scale-[0.95] py-1
          ${isActive ? 'text-green-400 font-bold' : 'text-slate-400 hover:text-slate-200'}`}
        style={{
          transition: 'color 200ms cubic-bezier(0.23, 1, 0.32, 1), transform 150ms cubic-bezier(0.23, 1, 0.32, 1)'
        }}
      >
        <span className={`text-green-500 font-bold transition-all duration-300 ease-out overflow-hidden flex items-center
          ${isActive ? 'max-w-[12px] opacity-100 mr-1.5' : 'max-w-0 opacity-0 mr-0'}`}
        >
          {'>'}
        </span>
        <span>{label}</span>
      </button>
    );
  };

  const renderNavLinkExternal = (to: string, label: string) => {
    return (
      <NavLink 
        to={to} 
        className="text-xs tracking-widest uppercase font-mono flex items-center active:scale-[0.95] py-1 text-slate-400 hover:text-slate-200"
        style={{
          transition: 'color 200ms cubic-bezier(0.23, 1, 0.32, 1), transform 150ms cubic-bezier(0.23, 1, 0.32, 1)'
        }}
      >
        <span>{label}</span>
      </NavLink>
    );
  };

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
                    {renderNavLink('home', 'Home')}
                    {renderNavLink('skills', 'Skills')}
                    {renderNavLink('projects', 'Projects')}
                    {renderNavLink('about', 'About')}
                    {renderNavLink('contact', 'Contact')}
                    </>
                ) : (
                    <>
                    {renderNavLinkExternal('/', 'Home')}
                    {renderNavLinkExternal('/', 'Return_Root')}
                    </>
                )}
            </div>
            
            {/* Terminal Toggle Button */}
            <button 
                onClick={toggleTerminal}
                className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-sm text-green-400 text-xs hover:bg-green-500 hover:text-black active:scale-[0.97] group"
                style={{
                  transition: 'background-color 200ms cubic-bezier(0.23, 1, 0.32, 1), border-color 200ms cubic-bezier(0.23, 1, 0.32, 1), color 200ms cubic-bezier(0.23, 1, 0.32, 1), transform 150ms cubic-bezier(0.23, 1, 0.32, 1)'
                }}
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
