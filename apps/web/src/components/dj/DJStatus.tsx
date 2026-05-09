// @ai-radio/web — DJ Status header with ON AIR indicator
// ===================================================================

import { useDJStore } from '../../stores/djStore';
import { useAppStore } from '../../stores/appStore';
import { nowHHMM } from '../../lib/time';

export function DJStatus(): JSX.Element {
  const dj = useDJStore();
  const isConnected = useAppStore((s) => s.connectionStatus === 'connected');

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* ON AIR indicator */}
        <div className="flex items-center gap-1.5">
          <div className={`onair-dot ${!isConnected ? 'opacity-40' : ''}`} />
          <span className="text-[9px] tracking-[0.15em] uppercase text-onair font-bold">
            ON AIR
          </span>
        </div>

        {/* DJ Name */}
        <span className="text-sm font-medium text-text-primary tracking-wide">
          夜汐
        </span>
      </div>

      {/* AI State + Clock */}
      <div className="flex items-center gap-3">
        {dj.thinking !== 'idle' && (
          <span className="text-xs digital animate-pulse">
            {dj.thinking === 'thinking' ? '思考中...' :
             dj.thinking === 'searching' ? '检索中...' :
             dj.thinking === 'composing' ? '编写中...' :
             dj.thinking === 'speaking' ? '播报中...' : ''}
          </span>
        )}
        <span className="text-sm digital">
          {nowHHMM()}
        </span>
      </div>
    </div>
  );
}
