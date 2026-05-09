// @ai-radio/web — Weather mini widget
// ===================================================================

import { useDJStore } from '../../stores/djStore';
import { GlassPanel } from '../common/GlassPanel';

export function WeatherWidget(): JSX.Element {
  const weather = useDJStore((s) => s.weather);

  if (!weather) return <></>;

  return (
    <GlassPanel className="px-3 py-2">
      <div className="flex items-center gap-3">
        <span className="text-lg">☁️</span>
        <div>
          <p className="text-sm text-text-primary">{weather.temperature}°C {weather.condition}</p>
          <p className="text-[10px] text-text-muted">{weather.city}</p>
        </div>
      </div>
    </GlassPanel>
  );
}
