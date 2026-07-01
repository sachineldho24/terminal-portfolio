export interface Project {
  id: string;
  name: string;
  shortDescription: string;
  fullDescription: string;
  date: string;
  technologies: string[];
  status: 'DEPLOYED' | 'IN_DEVELOPMENT' | 'ARCHIVED';
  permissions: string; // e.g. "drwx------"
  size: number; // in bytes (simulated)
  user: string;
  image: string;
  gallery: string[];
  repoLink?: string;
  demoLink?: string;
}

export interface NavItem {
  label: string;
  path: string;
}