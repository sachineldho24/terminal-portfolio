import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Minus, Square, Terminal, Loader } from 'lucide-react';
import { PROJECTS } from '../constants';

interface TerminalCLIProps {
  isOpen: boolean;
  onClose: () => void;
}

interface HistoryItem {
  type: 'input' | 'output' | 'system';
  content: React.ReactNode;
}

const TerminalCLI: React.FC<TerminalCLIProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([
    { type: 'system', content: 'Welcome to PORTFOLIO_OS [Version 1.0.0]' },
    { type: 'system', content: '(c) 2026 Sachin Eldho. All rights reserved.' },
    { type: 'system', content: 'Type "help" for a list of available commands.' },
    { type: 'system', content: '' } // spacer
  ]);
  const [isMatrixMode, setIsMatrixMode] = useState(false);
  
  // Draggable State
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Entry / Exit transition states
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const animTimer = requestAnimationFrame(() => {
        setIsTransitioning(true);
      });
      return () => cancelAnimationFrame(animTimer);
    } else {
      setIsTransitioning(false);
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Initialize position to center on open
  useEffect(() => {
    if (isOpen) {
      const initialX = Math.max(0, (window.innerWidth - 600) / 2);
      const initialY = Math.max(0, (window.innerHeight - 400) / 2);
      setPosition({ x: initialX, y: initialY });
      
      // Auto-focus input
      const timer = setTimeout(() => inputRef.current?.focus(), 150);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, isOpen]);

  // Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    dragOffset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      e.preventDefault();
      setPosition({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Focus input on click anywhere in terminal
  const handleTerminalClick = () => {
    if (!window.getSelection()?.toString()) {
        inputRef.current?.focus();
    }
  };

  const handleCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim();
    const parts = trimmedCmd.split(' ');
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    // Add input to history
    const newHistory: HistoryItem[] = [...history, { type: 'input', content: trimmedCmd }];

    switch (command) {
      case 'help':
        newHistory.push({
          type: 'output',
          content: (
            <div className="space-y-1 text-slate-300">
              <p>Available commands:</p>
              <div className="grid grid-cols-[100px_1fr] gap-2">
                <span className="text-green-500">help</span> <span>Shows this help message</span>
                <span className="text-green-500">ls</span> <span>List directory contents</span>
                <span className="text-green-500">cd</span> <span>Change directory (e.g., cd projects)</span>
                <span className="text-green-500">cat</span> <span>Print file content</span>
                <span className="text-green-500">clear</span> <span>Clear terminal screen</span>
                <span className="text-green-500">whoami</span> <span>Display current user</span>
                <span className="text-green-500">date</span> <span>Display system date/time</span>
                <span className="text-green-500">sysinfo</span> <span>Display system information</span>
                <span className="text-green-500">matrix</span> <span>Toggle matrix mode</span>
                <span className="text-green-500">exit</span> <span>Close terminal</span>
              </div>
            </div>
          )
        });
        break;

      case 'ls':
        if (args[0] === '-la' || !args[0]) {
           newHistory.push({
            type: 'output',
            content: (
              <div className="grid grid-cols-[100px_1fr] gap-x-4 text-slate-300">
                <div className="flex gap-4"><span>drwxr-xr-x</span> <span>user</span></div> <span className="text-blue-400 font-bold">projects/</span>
                <div className="flex gap-4"><span>-rw-r--r--</span> <span>user</span></div> <span>about.txt</span>
                <div className="flex gap-4"><span>-rw-r--r--</span> <span>user</span></div> <span>contact.md</span>
                <div className="flex gap-4"><span>-rwxr-xr-x</span> <span>root</span></div> <span className="text-green-500">portfolio.sh</span>
              </div>
            )
          });
        } else if (args[0] === 'projects' || args[0] === 'projects/') {
             newHistory.push({
                type: 'output',
                content: (
                  <div className="space-y-1">
                    {PROJECTS.map(p => (
                        <div key={p.id} className="text-blue-400 font-bold">{p.id}</div>
                    ))}
                  </div>
                )
             });
        } else {
            newHistory.push({ type: 'output', content: `ls: cannot access '${args[0]}': No such file or directory` });
        }
        break;

      case 'cd':
        const target = args[0];
        if (!target || target === '~' || target === '/') {
            navigate('/');
            newHistory.push({ type: 'output', content: 'Navigated to root.' });
        } else if (target === 'projects') {
             // In a real SPA, this might just scroll. We'll navigate home and hash.
             navigate('/');
             setTimeout(() => {
                 document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
             }, 100);
             newHistory.push({ type: 'output', content: 'Entering projects directory...' });
        } else {
             const project = PROJECTS.find(p => p.id === target || p.id === target.replace('projects/', ''));
             if (project) {
                 navigate(`/project/${project.id}`);
                 newHistory.push({ type: 'output', content: `Navigating to ${project.name}...` });
             } else {
                 newHistory.push({ type: 'output', content: `cd: ${target}: No such file or directory` });
             }
        }
        break;

      case 'cat':
        const file = args[0];
        if (file === 'about.txt') {
            newHistory.push({
                type: 'output',
                content: "Name: Sachin Eldho\nRole: AI & Full-Stack Developer\nFocus: LLMs, RAG, SaaS, mobile apps\nStatus: Open to opportunities."
            });
        } else if (file === 'contact.md') {
             newHistory.push({
                type: 'output',
                content: "Email: sachineldho999@gmail.com\nGitHub: github.com/sachineldho24\nLinkedIn: linkedin.com/in/sachin-eldho\nTwitter/X: x.com/sachin_eldho24"
            });
        } else if (file === 'portfolio.sh') {
             newHistory.push({ type: 'output', content: "#!/bin/bash\n# Init system...\necho 'Loading visual assets...'" });
        } else {
             newHistory.push({ type: 'output', content: `cat: ${file}: No such file or directory` });
        }
        break;

      case 'clear':
        setHistory([]);
        setInput('');
        return; // Early return to avoid adding "clear" to empty history

      case 'whoami':
        newHistory.push({ type: 'output', content: 'visitor@portfolio' });
        break;

      case 'date':
        newHistory.push({ type: 'output', content: new Date().toString() });
        break;
      
      case 'sysinfo':
        newHistory.push({
            type: 'output',
            content: (
                <div className="font-mono text-xs leading-tight text-slate-300">
<pre>{`
   .d8888b.  
  d88P  Y88b 
  888    888 
  888    888 .d8888b  
  888    888 88K      
  888    888 "Y8888b. 
  Y88b  d88P      X88 
   "Y8888P"   88888P' 
`}</pre>
                    <div className="mt-2 space-y-1">
                        <p><span className="text-green-500 font-bold">OS:</span> WebOS v1.0.0</p>
                        <p><span className="text-green-500 font-bold">Kernel:</span> React 18.2.0</p>
                        <p><span className="text-green-500 font-bold">Uptime:</span> Forever</p>
                        <p><span className="text-green-500 font-bold">Shell:</span> ZSH (Web Emulation)</p>
                        <p><span className="text-green-500 font-bold">Resolution:</span> {window.innerWidth}x{window.innerHeight}</p>
                    </div>
                </div>
            )
        })
        break;

      case 'matrix':
        setIsMatrixMode(!isMatrixMode);
        newHistory.push({ type: 'output', content: isMatrixMode ? 'Matrix mode deactivated.' : 'Wake up, Neo...' });
        break;

      case 'exit':
        onClose();
        break;

      case '':
        break;

      default:
        newHistory.push({ type: 'output', content: `Command not found: ${command}. Type 'help' for available commands.` });
    }

    setHistory(newHistory);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCommand(input);
    }
  };

  if (!shouldRender) return null;

  return (
    <div 
        className={`fixed w-[90vw] md:w-[600px] h-[60vh] md:h-[400px] z-50 flex flex-col shadow-2xl rounded-sm overflow-hidden font-mono text-sm border border-slate-700 bg-black/95 backdrop-blur-md transition-all duration-200 ease-out
          ${isTransitioning ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
        `}
        style={{ 
            top: position.y, 
            left: position.x,
            willChange: 'transform, opacity'
        }}
    >
        {/* Matrix Effect Overlay */}
        {isMatrixMode && (
             <div className="absolute inset-0 pointer-events-none opacity-10 overflow-hidden z-0">
                 <div className="animate-matrix text-green-500 text-xs leading-3 break-all">
                     {Array(5000).fill(0).map(() => String.fromCharCode(33 + Math.random() * 93)).join('')}
                 </div>
             </div>
        )}

      {/* Title Bar (Drag Handle) */}
      <div 
        className="bg-slate-900/90 border-b border-slate-700 p-2 flex justify-between items-center select-none relative z-10 cursor-move"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2 text-slate-400 px-2 pointer-events-none">
          <Terminal className="w-4 h-4 text-green-500" />
          <span className="text-xs font-bold tracking-wider">user@portfolio:~</span>
        </div>
        <div className="flex items-center gap-1" onMouseDown={(e) => e.stopPropagation()}>
          <button onClick={onClose} className="p-1 hover:bg-slate-800 rounded group active:scale-[0.90] transition-transform">
            <Minus className="w-3 h-3 text-slate-500 group-hover:text-white" />
          </button>
          <button className="p-1 hover:bg-slate-800 rounded group active:scale-[0.90] transition-transform">
             <Square className="w-3 h-3 text-slate-500 group-hover:text-white" />
          </button>
          <button onClick={onClose} className="p-1 hover:bg-red-900/50 rounded group active:scale-[0.90] transition-transform">
            <X className="w-3 h-3 text-slate-500 group-hover:text-red-400" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div 
        ref={scrollRef}
        onClick={handleTerminalClick}
        className="flex-1 p-4 overflow-y-auto overflow-x-hidden text-slate-200 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent relative z-10"
      >
        <div className="space-y-1">
          {history.map((item, i) => (
            <div key={i} className={`${item.type === 'input' ? 'mt-4' : 'mt-1'} break-words whitespace-pre-wrap`}>
              {item.type === 'input' && (
                <span className="text-green-500 mr-2 font-bold">user@portfolio:~$</span>
              )}
              {item.content}
            </div>
          ))}
        </div>

        {/* Input Line */}
        <div className="flex items-center mt-2 group">
          <span className="text-green-500 mr-2 font-bold shrink-0">user@portfolio:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-transparent border-none outline-none text-slate-100 w-full font-mono caret-green-500"
            autoComplete="off"
            spellCheck="false"
            autoFocus
          />
        </div>
        {/* Blinking Block Cursor if input is empty (visual flair) */}
        {input === '' && (
            <div className="w-2.5 h-5 bg-green-500/50 animate-pulse absolute bottom-4 left-[150px] pointer-events-none hidden md:block"></div>
        )}
      </div>
    </div>
  );
};

export default TerminalCLI;