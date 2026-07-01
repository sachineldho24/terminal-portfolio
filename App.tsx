import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Scanline from './components/Scanline';
import Home from './pages/Home';
import ProjectDetail from './pages/ProjectDetail';
import TerminalCLI from './components/TerminalCLI';

// Wrapper to handle scroll to top on route change
const ScrollToTop = () => {
    const { pathname } = useLocation();
    
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);

    return null;
}

const App: React.FC = () => {
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);

  const toggleTerminal = () => {
    setIsTerminalOpen(prev => !prev);
  };

  return (
    <Router>
      <ScrollToTop />
      <div className="relative bg-[#050505] min-h-screen text-slate-200 selection:bg-green-500 selection:text-black">
        <Scanline />
        <Navbar toggleTerminal={toggleTerminal} />
        
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
          </Routes>
        </main>

        <TerminalCLI isOpen={isTerminalOpen} onClose={() => setIsTerminalOpen(false)} />
      </div>
    </Router>
  );
};

export default App;
