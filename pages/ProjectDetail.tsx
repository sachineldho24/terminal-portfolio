import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PROJECTS } from '../constants';
import { Terminal, Code, Cpu, Globe, ArrowUp } from 'lucide-react';

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const project = PROJECTS.find(p => p.id === id);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 font-mono">
        ERROR: PROJECT_NOT_FOUND
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20 min-h-screen max-w-7xl mx-auto px-6 font-mono bg-[#050505]">
      {/* Header */}
      <header className="mb-16 pb-8">
        <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="text-green-500">{'>'}</span>
                {project.name}: {project.shortDescription.split(' ')[0]}_System
                <span className="w-3 h-8 md:h-12 bg-slate-500 animate-pulse inline-block align-middle ml-1"></span>
            </h1>
        </div>
        
        {/* Description Section */}
        <div className="mb-12">
             <div className="flex items-center gap-2 text-slate-500 text-sm font-bold mb-4 uppercase tracking-widest">
                <span>:: DESCRIPTION ::</span>
             </div>
             <p className="text-slate-300 text-lg leading-relaxed max-w-4xl border-l-2 border-slate-800 pl-6">
                {project.fullDescription}
            </p>
        </div>

        {/* Technologies Section */}
        <div className="mb-12">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-bold mb-4 uppercase tracking-widest">
                <span>:: TECHNOLOGIES_USED ::</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {project.technologies.map((tech, i) => (
                    <span key={i} className="text-green-500 font-mono hover:text-white transition-colors cursor-default">
                        [{tech}]
                    </span>
                ))}
            </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-4 mb-16">
            {project.demoLink && (
                <a 
                  href={project.demoLink} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="px-6 py-3 bg-white/5 border border-white/20 text-white font-bold tracking-wider text-sm flex items-center gap-2 hover:bg-white hover:text-black active:scale-[0.97] rounded-sm"
                  style={{
                    transition: 'background-color 250ms cubic-bezier(0.23, 1, 0.32, 1), border-color 250ms cubic-bezier(0.23, 1, 0.32, 1), color 250ms cubic-bezier(0.23, 1, 0.32, 1), transform 150ms cubic-bezier(0.23, 1, 0.32, 1)'
                  }}
                >
                    <span className="text-green-500 group-hover:text-black">$</span> RUN_LIVE_DEMO
                </a>
            )}
            {project.repoLink && (
                <a 
                  href={project.repoLink} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="px-6 py-3 border border-transparent text-slate-400 hover:text-white font-bold tracking-wider text-sm flex items-center gap-2 active:scale-[0.97]"
                  style={{
                    transition: 'color 250ms cubic-bezier(0.23, 1, 0.32, 1), transform 150ms cubic-bezier(0.23, 1, 0.32, 1)'
                  }}
                >
                    <span className="text-slate-600">$</span> VIEW_SOURCE_CODE
                </a>
            )}
        </div>

      </header>

      {/* Content Grid (Visual Data + Metadata) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Visual Data */}
        <div className="lg:col-span-2 space-y-8 p-8 rounded-sm bg-slate-900/30 backdrop-blur-xl border border-white/5 relative overflow-hidden">
             {/* Liquid Glass Overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/[0.02] via-transparent to-transparent pointer-events-none"></div>
            
            <section className="relative z-10">
                <h2 className="text-slate-500 text-sm font-bold mb-6 flex items-center gap-2 uppercase tracking-widest">
                    :: VISUAL_DATA ::
                </h2>
                <div className="grid grid-cols-1 gap-6">
                    {project.gallery.map((img, i) => (
                        <div key={i} className="relative group overflow-hidden border border-white/10 bg-black">
                             <div className="absolute top-2 left-2 text-[10px] text-green-500/80 font-mono z-20 flex gap-2">
                                <span className="bg-black/80 px-1">IMG_{(i + 1).toString().padStart(2, '0')}</span>
                            </div>
                            <img 
                                src={img} 
                                alt={`Visual Data ${i}`} 
                                className="w-full h-auto object-cover opacity-80 group-hover:opacity-100 group-hover:scale-[1.03]"
                                style={{
                                  transition: 'opacity 500ms cubic-bezier(0.23, 1, 0.32, 1), transform 750ms cubic-bezier(0.23, 1, 0.32, 1)',
                                  willChange: 'transform, opacity'
                                }}
                                loading="lazy"
                                decoding="async"
                            />
                            {/* Overlay Scanline */}
                            <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none z-10"></div>
                        </div>
                    ))}
                </div>
            </section>
        </div>

        {/* Right Column: Metadata Sidebar */}
        <div className="lg:col-span-1 sticky top-32 h-fit space-y-6 p-6 rounded-sm bg-slate-900/30 backdrop-blur-xl border border-white/5 relative">
             <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/[0.02] via-transparent to-transparent pointer-events-none"></div>
             
             <div className="relative z-10 font-mono text-xs">
                <div className="mb-6 pb-6 border-b border-white/5">
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2 tracking-wider">
                        <Terminal className="w-3 h-3 text-green-500" />
                        PROJECT_METADATA
                    </h3>
                    
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-slate-500">PERMISSIONS:</span>
                            <span className="text-green-400">{project.permissions}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">USER:</span>
                            <span className="text-slate-300">{project.user}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">DATE:</span>
                            <span className="text-slate-300">{project.date}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">SIZE:</span>
                            <span className="text-slate-300">{project.size}KB</span>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-white font-bold mb-4 flex items-center gap-2 tracking-wider">
                        <Cpu className="w-3 h-3 text-green-500" />
                        SYSTEM_LOG
                    </h3>
                    <div className="space-y-1 text-slate-500 opacity-70">
                        <p>{'>'} init_sequence_start</p>
                        <p>{'>'} loading assets... OK</p>
                        <p>{'>'} mounting volumes... OK</p>
                        <p>{'>'} status: {project.status}</p>
                        <p className="text-green-500 animate-pulse">{'>'} system_ready_</p>
                    </div>
                </div>
             </div>
        </div>

      </div>

        <div className="mt-24 flex justify-between border-t border-slate-900 pt-8">
            <Link to="/" className="text-xs text-slate-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-2">
                {'<'} RETURN_ROOT
            </Link>
            <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-xs text-slate-500 hover:text-green-500 transition-colors uppercase tracking-widest flex items-center gap-2"
            >
                SCROLL_TOP <ArrowUp className="w-3 h-3" />
            </button>
        </div>
    </div>
  );
};

export default ProjectDetail;