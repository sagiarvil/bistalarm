const fs = require('fs');
let css = fs.readFileSync('app/globals.css', 'utf8');

css = css.replace(/@keyframes slot-reel-spin-fast {[\s\S]*?100% {\s*transform: translateY\(-50%\);\s*}\s*}/,
`@keyframes slot-reel-spin-fast {
  0% { transform: translateY(-50%); }
  100% { transform: translateY(0); }
}`);

css = css.replace(/\.animate-slot-spinning {[\s\S]*?will-change: transform;\s*}/,
`.animate-slot-spinning {
  animation: slot-reel-spin-fast 0.12s linear infinite !important;
  will-change: transform;
  filter: blur(1.5px) drop-shadow(0 0 5px rgba(245,158,11,0.5));
}`);

fs.writeFileSync('app/globals.css', css);
console.log("Slot CSS patched");
