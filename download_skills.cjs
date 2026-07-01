const fs = require('fs');
const path = require('path');
const https = require('https');

const SKILLS_DIR = path.join(__dirname, 'public', 'skills');

// Ensure skills folder exists
if (!fs.existsSync(SKILLS_DIR)) {
    fs.mkdirSync(SKILLS_DIR, { recursive: true });
}

// Fallback SVGs in case downloads fail or for custom tools
const FALLBACK_SVGS = {
    python: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.895 2C8.358 2 8.604 3.535 8.604 3.535l.006 1.547h3.327v.475H7.079S5 5.334 5 8.877c0 3.542 1.83 3.427 1.83 3.427h1.092v-1.545c0-2.32 1.905-2.227 1.905-2.227h3.294s1.844-.06 1.844-2.19c0-2.128-1.545-2.227-1.545-2.227H11.9l-.005-2.115z" fill="#387EB8"/>
        <path d="M12.105 22c3.537 0 3.291-1.535 3.291-1.535l-.006-1.547h-3.326v-.475h4.858S19 18.666 19 15.123c0-3.542-1.83-3.427-1.83-3.427h-1.092v1.545c0 2.32-1.905 2.227-1.905 2.227h-3.294s-1.844.06-1.844 2.19c0 2.128 1.545 2.227 1.545 2.227h1.535l.005 2.115z" fill="#FFE052"/>
        <circle cx="10.25" cy="5.25" r="0.75" fill="#fff"/>
        <circle cx="13.75" cy="18.75" r="0.75" fill="#000"/>
    </svg>`,
    javascript: `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" fill="#F7DF1E"/>
        <text x="14" y="20" fill="#000" fontSize="9" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">JS</text>
    </svg>`,
    html5: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.5 2L4.2 19.3L12 21.5L19.8 19.3L21.5 2H2.5Z" fill="#E34F26"/>
        <path d="M12 3.8V19.7L18.2 18L19.5 4.8H12V3.8Z" fill="#EF652A"/>
        <path d="M12 9.5H8.3L8.1 7.2H12V5.2H6L6.5 11.5H12V9.5ZM12 14.7L9.5 14L9.3 12H7.3L7.7 16L12 17.2V14.7Z" fill="#EAEAEA"/>
        <path d="M12 9.5V11.5H15.4L15.1 14L12 14.7V17.2L16.3 16L16.8 9.5H12ZM12 5.2V7.2H17.8L18 5.2H12Z" fill="#FFFFFF"/>
    </svg>`,
    css3: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2.5 2L4.2 19.3L12 21.5L19.8 19.3L21.5 2H2.5Z" fill="#1572B6"/>
        <path d="M12 3.8V19.7L18.2 18L19.5 4.8H12V3.8Z" fill="#33A9DC"/>
        <path d="M12 9.5H8.3L8.1 7.2H12V5.2H6.1L6.5 11.5H12V9.5ZM12 14.7L9.5 14L9.3 12H7.3L7.7 16L12 17.2V14.7Z" fill="#EAEAEA"/>
        <path d="M12 9.5V11.5H15.4L15.1 14L12 14.7V17.2L16.3 16L16.8 9.5H12ZM12 5.2V7.2H17.8L18 5.2H12Z" fill="#FFFFFF"/>
    </svg>`,
    sql: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 3.34 2 5V19C2 20.66 6.48 22 12 22C17.52 22 22 20.66 22 19V5C22 3.34 17.52 2 12 2Z" fill="#F29111"/>
        <path d="M22 8.5C22 9.66 17.52 10.6 12 10.6C6.48 10.6 2 9.66 2 8.5V12C2 13.66 6.48 15 12 15C17.52 15 22 13.66 22 12V8.5Z" fill="#E37A08"/>
        <path d="M22 14.5C22 15.66 17.52 16.6 12 16.6C6.48 16.6 2 15.66 2 14.5V18C2 19.66 6.48 21 12 21C17.52 21 22 19.66 22 18V14.5Z" fill="#B35F00"/>
        <text x="12" y="14" fill="#FFFFFF" fontSize="6.5" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">SQL</text>
    </svg>`,
    nextjs: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11.5" fill="black" stroke="#333"/>
        <path d="M16.5 7.5L8.5 17.5H7.5V6.5H8.5V14.5L15.5 6.5H16.5V7.5Z" fill="white"/>
        <rect x="15" y="6.5" width="1" height="11" fill="white"/>
    </svg>`,
    fastapi: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11" fill="#009688"/>
        <path d="M13 3L6 13H12L11 21L18 11H12L13 3Z" fill="white"/>
    </svg>`,
    supabase: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.7 2.2L4.7 12.3C4.3 12.7 4.6 13.5 5.2 13.5H11.5V21.8L20.5 11.7C20.9 11.3 20.6 10.5 20H13.7V2.2Z" fill="#3ECF8E"/>
    </svg>`,
    postgresql: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM11.6 5.8C13.2 5.8 14.5 6.5 15.2 7.8C15.7 7.7 16.2 7.8 16.7 8C17.3 8.3 17.8 8.8 18.2 9.4C18.6 10 18.8 10.8 18.8 11.6C18.8 13.3 17.8 14.7 16.4 15.4C15.8 15.7 15.1 15.9 14.4 15.9C13.2 15.9 12.1 15.3 11.4 14.4C10.7 15.3 9.6 15.9 8.4 15.9C7.7 15.9 7 15.7 6.4 15.4C5 14.7 4 13.3 4 11.6C4 10.8 4.2 10 4.6 9.4C5 8.8 5.5 8.3 6.1 8C6.6 7.8 7.1 7.7 7.6 7.8C8.3 6.5 9.6 5.8 11.2 5.8H11.6Z" fill="#336791"/>
    </svg>`,
    mysql: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18.5 12C18.5 15.58 15.58 18.5 12 18.5C8.42 18.5 5.5 15.58 5.5 12C5.5 8.42 8.42 5.5 12 5.5C15.58 5.5 18.5 8.42 18.5 12Z" stroke="#00758F" strokeWidth="2"/>
        <path d="M12 3C7 3 3 7 3 12C3 15 4.5 17.5 7 19C7.5 19.3 8 19.5 8.5 19.7" stroke="#F29111" strokeWidth="2" strokeLinecap="round"/>
    </svg>`,
    mongodb: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C11.5 4 9 9 9 13C9 16.5 10.8 19.5 12 21C13.2 19.5 15 16.5 15 13C15 9 12.5 4 12 2Z" fill="#47A248"/>
        <path d="M12 2V21" stroke="#3FA040" strokeWidth="1.5"/>
    </svg>`,
    git: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.9 11.2L12.8 2.1C12.3 1.6 11.5 1.6 11 2.1L8.9 4.2L11.7 7C12.4 6.8 13.2 7.1 13.7 7.6C14.3 8.2 14.5 9.1 14.2 9.9L17 12.7C17.8 12.4 18.7 12.6 19.3 13.2C20 13.9 20 15 19.3 15.7C18.6 16.4 17.5 16.4 16.8 15.7C16.3 15.2 16.1 14.4 16.3 13.7L13.6 11C13.2 11.2 12.7 11.3 12.2 11.3C11.5 11.3 10.9 11 10.4 10.5C9.9 10 9.7 9.3 9.8 8.6L7 5.8L2.1 10.7C1.6 11.2 1.6 12 2.1 12.5L11.2 21.6C11.7 22.1 12.5 22.1 13 21.6L22 12.5C22.4 12 22.4 11.2 21.9 11.2ZM12.2 10.1C12.7 10.1 13 9.8 13 9.3C13 8.8 12.7 8.5 12.2 8.5C11.7 8.5 11.4 8.8 11.4 9.3C11.4 9.8 11.7 10.1 12.2 10.1Z" fill="#F05032"/>
    </svg>`,
    github: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017C2 16.442 4.866 20.197 8.841 21.53C9.341 21.622 9.522 21.312 9.522 21.043C9.522 20.803 9.514 19.986 9.509 19.143C6.727 19.753 6.14 17.786 6.14 17.786C5.685 16.618 5.029 16.307 5.029 16.307C4.12 15.681 5.097 15.694 5.097 15.694C6.1 15.766 6.629 16.737 6.629 16.737C7.521 18.28 8.966 17.833 9.537 17.575C9.628 16.92 9.887 16.475 10.174 16.222C7.953 15.967 5.617 15.097 5.617 11.226C5.617 10.123 6.005 9.222 6.64 8.517C6.539 8.261 6.196 7.233 6.737 5.845C6.737 5.845 7.575 5.574 9.48 6.874C10.278 6.651 11.133 6.539 11.983 6.535C12.833 6.539 13.688 6.651 14.488 6.874C16.391 5.574 17.226 5.845 17.226 5.845C17.77 7.233 17.426 8.261 17.327 8.517C17.964 9.222 18.35 10.123 18.35 11.226C18.35 15.108 16.01 15.964 13.78 16.214C14.139 16.527 14.46 17.143 14.46 18.087C14.46 19.434 14.448 20.523 14.448 20.852C14.448 21.124 14.627 21.439 15.138 21.529C19.11 20.192 22 16.441 22 12.017C22 6.484 17.522 2 12 2Z" fill="white"/>
    </svg>`,
    vscode: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 3.5L12 9.5L7.5 7L2 10.5V13.5L7.5 17L12 14.5L18 20.5L22 18.5V5.5L18 3.5ZM6.5 12L4 12V11.5L6.5 10.5V12Z" fill="#007ACC"/>
    </svg>`,
    claudecode: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2V22M2 12H22M4.93 4.93L19.07 19.07M4.93 19.07L19.07 4.93" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>`,
    antigravity: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 3L2 20H22L12 3Z" stroke="#10B981" strokeWidth="2" strokeLinejoin="round"/>
        <path d="M12 7L6 17H18L12 7Z" fill="#047857"/>
    </svg>`,
    cursor: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L4 9L12 16L20 9L12 2Z" fill="#E2E8F0"/>
        <path d="M4 9V17L12 22V16L4 9Z" fill="#94A3B8"/>
        <path d="M12 16V22L20 17V9L12 16Z" fill="#CBD5E1"/>
    </svg>`,
    langchain: `<svg viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>`,
    crewai: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="11" fill="white" stroke="#333" strokeWidth="1.5"/>
        <text x="12" y="15.5" fill="black" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">C</text>
    </svg>`,
    mcp: `<svg viewBox="0 0 24 24" fill="none" stroke="#818CF8" strokeWidth="2">
        <circle cx="12" cy="5" r="3" fill="#4F46E5"/>
        <circle cx="5" cy="17" r="3" fill="#4F46E5"/>
        <circle cx="19" cy="17" r="3" fill="#4F46E5"/>
        <line x1="12" y1="8" x2="6.5" y2="14.5" />
        <line x1="12" y1="8" x2="17.5" y2="14.5" />
        <line x1="8" y1="17" x2="16" y2="17" />
    </svg>`,
    rag: `<svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
        <path d="M12 2v6M5 14v4M19 14v4M12 8a7 7 0 0 0-7 6M12 8a7 7 0 0 1 7 6" />
        <circle cx="12" cy="5" r="2" fill="#22C55E"/>
        <circle cx="5" cy="14" r="2" fill="#22C55E"/>
        <circle cx="19" cy="14" r="2" fill="#22C55E"/>
        <circle cx="5" cy="19" r="2" fill="#22C55E"/>
        <circle cx="19" cy="19" r="2" fill="#22C55E"/>
    </svg>`,
    qdrant: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L4 7L12 12L20 7L12 2Z" fill="#F31260"/>
        <path d="M4 7V17L12 22V12L4 7Z" fill="#A80E40"/>
        <path d="M12 12V22L20 17V7L12 12Z" fill="#E81250"/>
    </svg>`,
    chroma: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="12" r="6" fill="#F59E0B" opacity="0.8"/>
        <circle cx="16" cy="12" r="6" fill="#3B82F6" opacity="0.8"/>
        <circle cx="12" cy="12" r="5" fill="#EF4444" opacity="0.9"/>
    </svg>`
};

const DOWNLOADS = [
    { name: 'python', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg' },
    { name: 'javascript', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg' },
    { name: 'html5', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg' },
    { name: 'css3', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg' },
    { name: 'mysql', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg' },
    { name: 'postgresql', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg' },
    { name: 'mongodb', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg' },
    { name: 'nextjs', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nextjs/nextjs-original.svg' },
    { name: 'fastapi', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/fastapi/fastapi-original.svg' },
    { name: 'supabase', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/supabase/supabase-original.svg' },
    { name: 'git', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg' },
    { name: 'vscode', url: 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg' },
];

function downloadFile(url, dest, fallback) {
    return new Promise((resolve) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`Successfully downloaded: ${path.basename(dest)}`);
                    resolve(true);
                });
            } else {
                file.close();
                fs.unlinkSync(dest); // Delete empty file
                // Write fallback instead
                fs.writeFileSync(dest, fallback);
                console.log(`Failed downloading (status ${response.statusCode}), wrote fallback for: ${path.basename(dest)}`);
                resolve(false);
            }
        }).on('error', (err) => {
            file.close();
            if (fs.existsSync(dest)) fs.unlinkSync(dest);
            fs.writeFileSync(dest, fallback);
            console.log(`Error: ${err.message}. Wrote fallback for: ${path.basename(dest)}`);
            resolve(false);
        });
    });
}

async function run() {
    // Write all fallback SVGs first to establish the assets
    for (const [name, svgContent] of Object.entries(FALLBACK_SVGS)) {
        const destPath = path.join(SKILLS_DIR, `${name}.svg`);
        fs.writeFileSync(destPath, svgContent);
    }
    console.log('Established initial asset baseline.');

    // Now, attempt to fetch the official icons from JSdelivr
    for (const item of DOWNLOADS) {
        const destPath = path.join(SKILLS_DIR, `${item.name}.svg`);
        const fallback = FALLBACK_SVGS[item.name];
        await downloadFile(item.url, destPath, fallback);
    }

    console.log('All skill assets loaded and verified!');
}

run();
