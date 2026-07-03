import React, { useState, useEffect } from 'react';

const Preloader: React.FC = () => {
  const [percent, setPercent] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [isDone, setIsDone] = useState(false);
  const [shouldRender, setShouldRender] = useState(true);

  useEffect(() => {
    // Prevent scrolling while loading
    document.body.style.overflow = 'hidden';

    const logMessages = [
      { p: 5, m: '> BOOT_SEQUENCE_START' },
      { p: 15, m: '[ OK ] Initializing WebGL pointillism context' },
      { p: 35, m: '[ OK ] Loading visual data models (developer-face.webp)' },
      { p: 55, m: '[ OK ] Connecting decentralized vector database client' },
      { p: 75, m: '[ OK ] Decrypting about_me.dat and project assets' },
      { p: 95, m: '[ OK ] Establishing secure SSH terminal connection' },
      { p: 100, m: '> PORTFOLIO_OS SYSTEM READY.' }
    ];

    let currentPercent = 0;
    const interval = setInterval(() => {
      // Simulate stuttered, hacker-style count up
      const increment = Math.floor(Math.random() * 8) + 2;
      currentPercent = Math.min(100, currentPercent + increment);
      setPercent(currentPercent);

      // Add corresponding logs as percentage passes thresholds
      logMessages.forEach(item => {
        if (currentPercent >= item.p && !logs.includes(item.m)) {
          setLogs(prev => {
            if (prev.includes(item.m)) return prev;
            return [...prev, item.m];
          });
        }
      });

      if (currentPercent === 100) {
        clearInterval(interval);
        // Delay slightly at 100% to let the user see "READY"
        setTimeout(() => {
          setIsDone(true);
          document.body.style.overflow = '';
          // Let slide animation complete before removing from DOM
          setTimeout(() => {
            setShouldRender(false);
          }, 800);
        }, 300);
      }
    }, 45);

    return () => {
      clearInterval(interval);
      document.body.style.overflow = '';
    };
  }, [logs]);

  if (!shouldRender) return null;

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#050505] flex flex-col justify-between p-6 sm:p-10 font-mono text-xs sm:text-sm text-green-500 transition-transform duration-700 pointer-events-none select-none
        ${isDone ? '-translate-y-full' : 'translate-y-0'}
      `}
      style={{
        transitionTimingFunction: 'cubic-bezier(0.85, 0, 0.15, 1)',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.95)'
      }}
    >
      {/* Top Meta Bar */}
      <div className="flex justify-between items-center opacity-60">
        <span>SACHIN_ELDHO // SYSTEM_BOOT</span>
        <span>BIOS V1.0.26</span>
      </div>

      {/* Center Console Logs */}
      <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full my-10 space-y-2">
        <div className="text-green-500/80 mb-6 text-sm">
          PORTFOLIO_OS [Version 1.0.0]<br />
          (c) 2026 Sachin Eldho. All rights reserved.
        </div>
        <div className="space-y-1.5 flex-1 overflow-hidden max-h-[300px]">
          {logs.map((log, idx) => (
            <div key={idx} className="flex gap-2 animate-in fade-in slide-in-from-bottom-1 duration-200">
              <span className="text-green-600/40 select-none">[{idx.toString().padStart(2, '0')}]</span>
              <span className={log.startsWith('[ OK ]') ? 'text-green-400/90' : 'text-green-500 font-bold'}>
                {log}
              </span>
            </div>
          ))}
        </div>

        {/* Progress Bar & Numeric Counter */}
        <div className="space-y-2 pt-6 border-t border-green-950/40">
          <div className="flex justify-between text-green-400 font-bold">
            <span>LOADING_SYSTEM_RESOURCES</span>
            <span>{percent}%</span>
          </div>
          {/* Progress Bar Track */}
          <div className="h-3 w-full border border-green-500/30 p-[2px] bg-black">
            <div
              className="h-full bg-green-500 shadow-[0_0_8px_#22c55e]"
              style={{
                width: `${percent}%`,
                transition: 'width 60ms linear'
              }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Footer Info */}
      <div className="flex justify-between items-center opacity-40 text-[10px]">
        <span>ESTABLISHING SECURE SSH NODE...</span>
        <span>PORT_22</span>
      </div>
    </div>
  );
};

export default Preloader;
