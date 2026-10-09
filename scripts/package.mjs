import { mkdirSync, cpSync } from 'node:fs';
mkdirSync('dist', { recursive: true });
for (const name of ['demo','docs','skills','README.md']) cpSync(name, `dist/${name}`, { recursive: true });
console.log('Created dist/ source bundle. No deployment or signed production build is performed.');
