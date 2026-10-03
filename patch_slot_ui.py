import re

with open('components/MonteCarloSlotGame.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the 5-step animation with a 3-step animation properly
old_anim = """    // 3. Makara Duruşu
    const t3 = setTimeout(() => {
      setReels(prev => [result.grid[0], result.grid[1], result.grid[2]]);
      setStoppingReels(prev => [true, true, true]);
      playSound('click');
    }, 1150);
    stepTimerRefs.current.push(t3);

    // 4. Makara Duruşu
    const t4 = setTimeout(() => {
      setReels(prev => [result.grid[0], result.grid[1], result.grid[2], result.grid[3], prev[4]]);
      setStoppingReels(prev => [true, true, true, true, false]);
      playSound('click');
    }, 1500);
    stepTimerRefs.current.push(t4);

    // 5. Makara Duruşu
    const t5 = setTimeout(() => {
      setReels(result.grid);
      setStoppingReels([true, true, true, true, true]);
      playSound('click');
      setIsTensionSpin(false);
    }, 1850);
    stepTimerRefs.current.push(t5);

    // Final Sonuç ve Kazanç Bildirimi
    const tFinal = setTimeout(() => {"""

new_anim = """    // 3. Makara Duruşu (Final)
    const t3 = setTimeout(() => {
      setReels(result.grid);
      setStoppingReels([true, true, true]);
      playSound('click');
      setIsTensionSpin(false);
    }, 1150);
    stepTimerRefs.current.push(t3);

    // Final Sonuç ve Kazanç Bildirimi
    const tFinal = setTimeout(() => {"""

if old_anim in content:
    content = content.replace(old_anim, new_anim)
    with open('components/MonteCarloSlotGame.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("UI Animation patched.")
else:
    print("UI Animation code not found.")

