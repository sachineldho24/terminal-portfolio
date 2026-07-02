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
      className={`relative flex items-center gap-4 py-3 px-4 cursor-pointer transition-all duration-200 font-mono text-sm md:text-base border-l-2 group
        ${isHovered ? 'bg-white/[0.03] border-green-500 text-green-400' : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.015]'}
      `}
      onMouseEnter={() => onHover(project)}
      onMouseLeave={() => onHover(null)}
      onClick={() => navigate(`/project/${project.id}`)}
    >
      {/* Index marker */}
      <span className={`text-xs font-mono w-5 shrink-0 ${isHovered ? 'text-green-500' : 'text-slate-700'}`}>
        {'>'} 
      </span>

      {/* Project Name */}
      <span className={`font-bold tracking-wide ${isHovered ? 'text-white' : 'text-slate-300'} transition-colors duration-200`}>
        {project.name}
      </span>

      {/* Status dot */}
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${project.status === 'DEPLOYED' ? 'bg-green-500' : 'bg-yellow-500'}`} />

      {/* Spacer */}
      <span className="flex-1" />

      {/* Date — subtle */}
      <span className={`hidden sm:inline text-xs tracking-wider ${isHovered ? 'text-slate-500' : 'text-slate-700'} transition-colors duration-200`}>
        {project.date}
      </span>

      {/* Arrow */}
      <span className={`text-sm ${isHovered ? 'text-green-500 translate-x-1' : 'text-slate-800'} transition-all duration-300`}>{'→'}</span>
    </div>
  );
};

export default ProjectListItem;