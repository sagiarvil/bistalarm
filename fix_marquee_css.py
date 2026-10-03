file_path = "components/LiveWinnersTicker.tsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Fix the CSS class usage
old_wrapper = """<div className="flex w-[200%] animate-marquee-infinite">
            {/* Tek Bir Liste, İki Kere Tekrar Eder (Seamless Loop) */}
            <div className="flex w-1/2 items-center justify-around gap-3 shrink-0">
              {winners.map((item) => (
                <WinnerCard key={`a-${item.id}`} item={item} />
              ))}
            </div>
            <div className="flex w-1/2 items-center justify-around gap-3 shrink-0">
              {winners.map((item) => (
                <WinnerCard key={`b-${item.id}`} item={item} />
              ))}
            </div>
          </div>"""

new_wrapper = """<div className="flex w-max animate-marquee-infinite hover:animation-play-state-paused gap-3">
            {/* Tek Bir Liste, İki Kere Tekrar Eder (Seamless Loop) */}
            <div className="flex w-max items-center justify-start gap-3 shrink-0 pr-3">
              {winners.map((item) => (
                <WinnerCard key={`a-${item.id}`} item={item} />
              ))}
            </div>
            <div className="flex w-max items-center justify-start gap-3 shrink-0 pr-3">
              {winners.map((item) => (
                <WinnerCard key={`b-${item.id}`} item={item} />
              ))}
            </div>
          </div>"""

content = content.replace(old_wrapper, new_wrapper)
with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

