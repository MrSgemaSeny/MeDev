const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Colors
      content = content.replace(/emerald-/g, 'indigo-');
      
      // Glassmorphism & Backgrounds
      content = content.replace(/bg-gray-950/g, 'bg-[#0B0C10]');
      
      // Update sidebar / cards from solid gray to glassmorphism
      // We will look for bg-gray-900 and replace with glass
      content = content.replace(/bg-gray-900 border border-gray-800/g, 'bg-slate-900/40 backdrop-blur-xl border border-white/10 shadow-2xl');
      content = content.replace(/bg-gray-900/g, 'bg-slate-900/40 backdrop-blur-xl');
      
      content = content.replace(/bg-gray-800/g, 'bg-slate-800/50');
      content = content.replace(/border-gray-800/g, 'border-white/10');
      content = content.replace(/border-gray-700/g, 'border-white/20');
      
      // Hover effects for cards / buttons
      content = content.replace(/hover:bg-gray-800 hover:text-white/g, 'hover:bg-white/10 hover:text-white transition-all duration-300');
      content = content.replace(/hover:border-indigo-500\/50/g, 'hover:border-indigo-400 hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] transition-all duration-300');
      content = content.replace(/transition-colors/g, 'transition-all duration-300');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log('Applied premium SaaS redesign!');
