// @ai-radio/web — Digital clock display
// ===================================================================

import { useState, useEffect } from 'react';
import { nowHHMM, getTimeOfDay } from '../../lib/time';

export function TimeDisplay(): JSX.Element {
  const [time, setTime] = useState(nowHHMM);

  useEffect(() => {
    const timer = setInterval(() => setTime(nowHHMM), 10_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center">
      <span className="text-5xl digital tracking-widest">{time}</span>
      <span className="text-xs text-text-muted mt-1 tracking-wider">
        {getTimeOfDay()} · AI Radio
      </span>
    </div>
  );
}
