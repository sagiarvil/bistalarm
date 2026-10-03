const fs = require('fs');
let code = fs.readFileSync('components/MonteCarloSlotGame.tsx', 'utf8');

code = code.replace(
  `                      ) : (
                        <div className={\`flex flex-col gap-1 \${isSpinning ? 'animate-slot-stop' : ''}\`}>
                          {reel.map((symId, rowIdx) => {`,
  `                      ) : (
                        <div className={\`flex flex-col gap-1 \${isSpinning ? 'animate-slot-stop' : ''}\`}>
                          {isSpinning && ['diamond', 'wild', 'seven'].map((symId, rowIdx) => {
                            const sym = getSymbol(symId);
                            return (
                              <div key={\`fake-\${rowIdx}\`} className="h-12 sm:h-14 md:h-16 bg-[#1c0f33] border border-purple-500/20 rounded-md flex flex-col items-center justify-center p-0.5 filter blur-[1.5px]">
                                <span className="text-2xl sm:text-3xl filter drop-shadow opacity-70">{sym.icon}</span>
                              </div>
                            );
                          })}
                          {reel.map((symId, rowIdx) => {`
);

fs.writeFileSync('components/MonteCarloSlotGame.tsx', code);

let css = fs.readFileSync('app/globals.css', 'utf8');
css = css.replace(/@keyframes slot-reel-bounce-stop {[\s\S]*?100% {\s*transform: translateY\(0\);\s*}\s*}/,
`@keyframes slot-reel-bounce-stop {
  0% { transform: translateY(-10%); filter: blur(3px); }
  50% { transform: translateY(calc(-50% + 16px)); filter: blur(0); }
  75% { transform: translateY(calc(-50% - 8px)); }
  100% { transform: translateY(-50%); }
}`);
fs.writeFileSync('app/globals.css', css);
console.log("Slot stop patched");
