import React from 'react';
import { Project } from '../types';
import { useNavigate } from 'react-router-dom';

interface ProjectListItemProps {
  project: Project;
  onHover: (project: Project | null) => void;
  isHovered: boolean;
}

const ProjectListItem: React.FC<ProjectListItemProps> = ({ project, onHover, isHovered }) => {
  const navigate = useNavigate();

  return (
    <div 
      className={`relative flex items-center gap-4 py-2 px-2 cursor-pointer transition-all duration-200 font-mono text-xs md:text-sm border-l-2
        ${isHovered ? 'bg-white/5 border-green-500 text-green-400' : 'border-transparent text-slate-400 hover:text-slate-200'}
      `}
      onMouseEnter={() => onHover(project)}
      onMouseLeave={() => onHover(null)}
      onClick={() => navigate(`/project/${project.id}`)}
    >
      {/* Permission & User Info - Hidden on very small screens, strictly formatted */}
      <div className="hidden lg:flex gap-4 min-w-fit text-slate-600 font-mono shrink-0">
        <span className="w-24">{project.permissions}</span>
        <span className="w-4 text-center">1</span>
        <span className="w-12 text-center text-slate-500">sachin</span>
        <span className="w-12 text-center text-slate-500">staff</span>
        <span className="w-16 text-right text-slate-500">{project.size}</span>
        <span className="w-24 text-right text-slate-500">{project.date}</span>
      </div>

      <span className="hidden lg:inline text-slate-700">|</span>
      
      {/* Project Name */}
      <div className="flex-1 flex items-center gap-2 overflow-hidden min-w-0">
        <span className="text-slate-500 hidden sm:inline">Project:</span>
        <span className={`whitespace-nowrap font-bold tracking-wide ${isHovered ? 'text-white' : 'text-slate-300'}`}>
          {project.name}
        </span>
      </div>

      {/* Trailing aesthetics */}
      <span className="hidden sm:inline text-slate-700">|</span>
      <span className={`${isHovered ? 'text-green-500 translate-x-1' : 'text-slate-700'} transition-transform duration-300`}>{'>'}</span>
    </div>
  );
};

export default ProjectListItem;