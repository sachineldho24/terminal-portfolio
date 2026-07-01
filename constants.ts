import { Project } from './types';

export const PROJECTS: Project[] = [
  {
    id: 'marginmint',
    name: 'MARGINMINT',
    shortDescription: 'Restaurant profit analytics SaaS for true per-dish margins.',
    fullDescription: 'MarginMint (dish-edge-pro) is a profit analytics SaaS for restaurant owners. It ingests daily order reports from Swiggy, Zomato, and direct WhatsApp orders, then calculates the actual net margin per dish per platform by automatically deducting commissions, food cost, and packaging cost. Features a unified revenue dashboard, CSV ingestion with fuzzy menu matching, and secure multi-tenant auth with per-owner row-level security.',
    date: 'Apr 18 2026',
    technologies: ['React 19', 'TanStack Start', 'TypeScript', 'Tailwind CSS v4', 'Supabase', 'Zod', 'Recharts', 'PapaParse'],
    status: 'DEPLOYED',
    permissions: 'drwxr-xr-x',
    size: 2480,
    user: 'sachin',
    // Analytics dashboard / data charts
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1543353071-873f17a7a088?auto=format&fit=crop&q=80&w=800'
    ],
    demoLink: 'https://dish-edge-pro.vercel.app',
    repoLink: 'https://github.com/sachineldho24/dish-edge-pro'
  },
  {
    id: 'calsnap',
    name: 'CALSNAP',
    shortDescription: 'AI-powered, offline-first calorie & nutrition tracker.',
    fullDescription: 'CalSnap is an offline-first mobile app that turns a photo or a plain-English description of a meal into instant macros, meal suggestions, and step-by-step recipes. It uses Gemini Vision to estimate calories and macros from food photos, a time-aware AI coach that suggests meals based on remaining macros, and a persistent AI memory that learns allergies, preferences, and cooking style across sessions. Includes pantry mode, a health-impact card, weekly progress charts, and pluggable AI providers (Gemini, Groq, OpenAI-compatible).',
    date: 'Mar 05 2026',
    technologies: ['React Native', 'Expo SDK 51', 'TypeScript', 'Gemini Vision', 'Groq', 'AsyncStorage'],
    status: 'DEPLOYED',
    permissions: 'drwxr-xr-x',
    size: 1860,
    user: 'sachin',
    // Healthy food / nutrition
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800'
    ],
    repoLink: 'https://github.com/sachineldho24/Calorie_Tracker'
  },
  {
    id: 'rag-ai',
    name: 'RAG_AI',
    shortDescription: 'Adaptive Retrieval-Augmented Generation agent in Python.',
    fullDescription: 'A Retrieval-Augmented Generation agent that enhances language-model responses by retrieving and incorporating relevant context from a dataset. It supports configurable embedding models, multi-provider LLMs (Ollama, Together AI, Gemini), and Tavily web search, with generation ranking and hallucination checking inspired by LangChain Adaptive RAG and Docling hybrid chunking. Backed by PostgreSQL for storage.',
    date: 'Feb 12 2026',
    technologies: ['Python', 'LangChain', 'Ollama', 'Together AI', 'Gemini', 'Tavily', 'PostgreSQL'],
    status: 'DEPLOYED',
    permissions: 'drwxr-xr-x',
    size: 980,
    user: 'sachin',
    // AI / neural network / data
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&q=80&w=800'
    ],
    repoLink: 'https://github.com/sachineldho24/rag-ai'
  },
  {
    id: 'i-am-affirmations',
    name: 'I_AM_AFFIRMATIONS',
    shortDescription: 'Personalized daily affirmations mobile app.',
    fullDescription: 'A React Native / Expo mobile app that delivers 240 curated affirmations across 8 personalized categories, fully offline with no backend. Features swipeable full-screen cards with gesture physics, an animated rotating gradient border as the signature visual, personalized onboarding, up to 3 daily push reminders, a favorites collection shareable as images, and a streak tracker with a 30-day calendar heatmap and milestone badges.',
    date: 'Jan 20 2026',
    technologies: ['React Native', 'Expo SDK 51', 'Expo Router', 'Reanimated', 'TypeScript', 'AsyncStorage'],
    status: 'DEPLOYED',
    permissions: 'drwxr-xr-x',
    size: 1320,
    user: 'sachin',
    // Calm / gradient / meditation
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&q=80&w=800'
    ],
    repoLink: 'https://github.com/sachineldho24/I-am-Affirmations'
  },
  {
    id: 'eyesoff',
    name: 'EYESOFF',
    shortDescription: 'Two-player cooperative chaos game for tech fests.',
    fullDescription: 'EyesOff is a browser-based, two-player cooperative chaos game built for college technical fests. One player operates the mouse blind while their teammate watches the screen and gives directions, racing through 6 escalating levels (Digital Cleanup, Password Panic, Bomb Defusal, Safe Cracker, Laser Heist, Maze Escape) while 9 chaos effects, such as inverted controls, ghost cursors, screen shake, zoom warp, and more, interfere. Includes team registration, a persistent leaderboard, and a millisecond timer.',
    date: 'May 02 2026',
    technologies: ['TypeScript', 'Vite', 'PixiJS', 'WebGL', 'ESLint'],
    status: 'DEPLOYED',
    permissions: 'drwxr-xr-x',
    size: 1540,
    user: 'sachin',
    // Arcade / gaming / neon
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800',
    gallery: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800'
    ],
    repoLink: 'https://github.com/sachineldho24/EyesOff'
  }
];

export const SOCIAL_LINKS = [
  { platform: 'GitHub', url: 'github.com/sachineldho24', icon: 'github' },
  { platform: 'LinkedIn', url: 'linkedin.com/in/sachin-eldho', icon: 'linkedin' },
  { platform: 'Twitter', url: 'x.com/sachin_eldho24', icon: 'twitter' }
];

export const CONTACT_EMAIL = 'sachineldho999@gmail.com';
