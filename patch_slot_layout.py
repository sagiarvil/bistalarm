import re

file_path = "components/MonteCarloSlotGame.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix the renderSymbol function to make it strictly bounded and responsive
new_render_symbol = """  const renderSymbol = (sym: any) => {
    // 4K Premium Stabilizasyon: Kırılmayı ve taşmayı engellemek için aspect-ratio ve flex bounding
    return (
      <div className="relative flex items-center justify-center w-full h-full p-2 sm:p-4 box-border">
        {/* Glow */}
        <div className="absolute inset-0 bg-yellow-400/20 blur-xl rounded-full scale-75"></div>
        {/* Symbol */}
        <span 
          className="relative z-10 filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.8)] flex items-center justify-center w-full h-full text-[clamp(2.5rem,8vmin,5.5rem)] leading-none select-none transition-transform duration-300" 
          style={{ textShadow: '0 5px 15px rgba(0,0,0,0.7), 0 0 30px rgba(255,215,0,0.5)' }}
        >
          {sym.icon}
        </span>
      </div>
    );
  };"""

content = re.sub(r'const renderSymbol =.*?return \(\n.*?<div className="relative flex items-center justify-center w-full h-full">.*?</div>\n\s*\);\n\s*};', new_render_symbol, content, flags=re.DOTALL)

# Ensure the rows don't have clipping issues and maintain absolute stability
# Remove `overflow-hidden` from the individual rows if it's causing clipping, 
# BUT the reel itself already has overflow-hidden which handles the spinning clipping correctly.
# The `h-1/3` rows:
content = content.replace('className="h-1/3 w-full border-b border-[#d4af37]/30 shadow-[0_2px_5px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center filter blur-[1.5px] scale-[0.98]"',
                          'className="h-1/3 w-full border-b border-black/20 shadow-[inset_0_-2px_10px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center filter blur-[1px] scale-[0.98] box-border"')

content = content.replace('className="h-1/3 w-full border-b border-[#d4af37]/30 shadow-[0_2px_5px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center filter blur-[2px] opacity-50 hidden sm:flex"',
                          'className="h-1/3 w-full border-b border-black/20 shadow-[inset_0_-2px_10px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center filter blur-[2px] opacity-50 hidden sm:flex box-border"')

content = content.replace('className="h-1/3 w-full border-b border-[#d4af37]/30 shadow-[0_2px_5px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center relative overflow-hidden transition-all duration-200"',
                          'className="h-1/3 w-full border-b border-black/20 shadow-[inset_0_-2px_10px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center relative transition-all duration-200 box-border"')

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)
