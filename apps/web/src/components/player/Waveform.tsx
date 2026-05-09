// @ai-radio/web — Audio waveform visualization bars
// ===================================================================

import { useEffect, useState } from 'react';
import { usePlayerStore } from '../../stores/playerStore';
import { audioEngine } from '../../lib/audio';

export function Waveform(): JSX.Element {
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const barCount = usePlayerStore((s) => s.barCount);
  const [bars, setBars] = useState<number[]>(Array.from({ length: barCount }, () => 0.3));

  useEffect(() => {
    if (!isPlaying) {
      setBars(Array.from({ length: barCount }, () => 0.2));
      return;
    }

    const interval = setInterval(() => {
      const freqData = audioEngine.getFrequencyData();
      if (freqData) {
        const newBars: number[] = [];
        const step = Math.floor(freqData.length / barCount);
        for (let i = 0; i < barCount; i++) {
          const val = freqData[i * step] ?? 0;
          newBars.push(Math.max(0.1, val / 255));
        }
        setBars(newBars);
      } else {
        // Mock waveform when no real data
        setBars(
          Array.from({ length: barCount }, () => 0.1 + Math.random() * (isPlaying ? 0.7 : 0.1)),
        );
      }
    }, 120);

    return () => clearInterval(interval);
  }, [isPlaying, barCount]);

  return (
    <div className="flex items-end justify-center gap-[3px] h-10">
      {bars.map((h, i) => (
        <div
          key={i}
          className="w-[3px] rounded-full bg-accent transition-all duration-100"
          style={{ height: `${Math.max(4, h * 40)}px`, opacity: isPlaying ? 0.8 : 0.3 }}
        />
      ))}
    </div>
  );
}
