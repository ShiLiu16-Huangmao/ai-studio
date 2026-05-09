// @ai-radio/web — Mobile-first app shell
// ===================================================================

import type { ReactNode } from 'react';
import { useAppStore } from '../../stores/appStore';

interface Props {
  header: ReactNode;
  main: ReactNode;
  player: ReactNode;
  chat: ReactNode;
}

export function AppShell({ header, main, player, chat }: Props): JSX.Element {
  const connectionStatus = useAppStore((s) => s.connectionStatus);

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-text-primary safe-bottom">
      {/* Header — DJ Status */}
      <header className="shrink-0 px-4 pt-3">
        {header}
      </header>

      {/* Connection indicator */}
      <div className="flex items-center justify-center gap-2 py-1">
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            connectionStatus === 'connected'
              ? 'bg-accent'
              : connectionStatus === 'connecting'
                ? 'bg-yellow-400 animate-pulse'
                : 'bg-onair'
          }`}
        />
        <span className="text-[10px] text-text-muted tracking-widest uppercase digital">
          {connectionStatus === 'connected' ? 'LIVE' : connectionStatus === 'connecting' ? 'CONNECTING' : 'OFFLINE'}
        </span>
      </div>

      {/* Main — Now Playing + Widgets */}
      <main className="flex-1 overflow-auto px-4 py-3">
        {main}
      </main>

      {/* Player Bar — Always visible bottom */}
      <div className="shrink-0 px-4 pb-2">{player}</div>

      {/* Chat Input — Fixed bottom */}
      <div className="shrink-0 px-2 pb-1">{chat}</div>
    </div>
  );
}
