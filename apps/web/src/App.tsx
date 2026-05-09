// @ai-radio/web — Root App: AI Radio PWA
// ===================================================================

import { useCallback } from 'react';
import { useChatStore } from './stores/chatStore';
import { usePlayerStore } from './stores/playerStore';
import { useDJStore } from './stores/djStore';
import { useAppStore } from './stores/appStore';
import { useWebSocket } from './hooks/useWebSocket';
import { useAudioPlayer } from './hooks/useAudioPlayer';
import { useMediaSession } from './hooks/useMediaSession';
import { apiClient } from './services/apiClient';
import { AppShell } from './components/layout/AppShell';
import { DJStatus } from './components/dj/DJStatus';
import { MoodIndicator } from './components/dj/MoodIndicator';
import { TimeDisplay } from './components/widgets/TimeDisplay';
import { WeatherWidget } from './components/widgets/WeatherWidget';
import { VinylDisc } from './components/player/VinylDisc';
import { PlayerBar } from './components/player/PlayerBar';
import { ChatPanel } from './components/chat/ChatPanel';
import { ChatInput } from './components/chat/ChatInput';

// Mock track for demo
const MOCK_TRACK = {
  id: 'mock_001',
  name: 'Fly Me to the Moon',
  artist: 'Frank Sinatra',
  album: "It Might as Well Be Swing",
  coverUrl: 'https://picsum.photos/400/400',
  mp3Url: '',
  duration: 239,
  source: 'netease' as const,
};

export function App(): JSX.Element {
  // Initialize WS (mock mode for MVP)
  useWebSocket(true);

  // Audio playback lifecycle
  useAudioPlayer();

  // Media Session API
  useMediaSession();

  // Store access
  const addMessage = useChatStore((s) => s.addMessage);
  const setStreaming = useChatStore((s) => s.setStreaming);
  const commitStreaming = useChatStore((s) => s.commitStreamingText);
  const play = usePlayerStore((s) => s.play);
  const setMode = useAppStore((s) => s.setMode);

  const handleSend = useCallback(async (text: string) => {
    // Add user message
    const userMsg = {
      id: `msg_${Date.now()}`,
      role: 'user' as const,
      content: text,
      timestamp: Date.now(),
    };
    addMessage(userMsg);

    setMode('chatting');
    setStreaming(true);

    try {
      // Call mock API
      const result = await apiClient.sendMessage(text);
      // Simulate streaming
      const chars = result.text.split('');
      for (let i = 0; i < chars.length; i++) {
        await new Promise((r) => setTimeout(r, 30));
        useChatStore.getState().appendStreamingText(chars[i] ?? '');
      }

      // Commit the streamed text
      commitStreaming();

      // Handle action
      if (result.action === 'recommend_music' && result.track) {
        play(MOCK_TRACK);
      }

      // Handle mood
      if (result.mood && 'valence' in (result.mood as Record<string, number>)) {
        const m = result.mood as { valence: number; energy: number };
        let moodLabel: 'chill' | 'energetic' | 'melancholy' | 'cheerful' | 'neutral' = 'neutral';
        if (m.valence >= 0.3 && m.energy >= 0.3) moodLabel = 'cheerful';
        else if (m.valence >= 0.3) moodLabel = 'chill';
        else if (m.valence < -0.2) moodLabel = 'melancholy';
        else if (m.energy >= 0.5) moodLabel = 'energetic';

        useDJStore.getState().updateFromServer({
          mood: moodLabel,
          thinking: 'idle',
        });
      }
    } catch {
      setStreaming(false);
      addMessage({
        id: `msg_err_${Date.now()}`,
        role: 'assistant',
        content: '抱歉，信号不太好... 请稍后再试。',
        timestamp: Date.now(),
      });
    }

    setMode('idle');
  }, [addMessage, setStreaming, commitStreaming, play, setMode]);

  // Header: DJ status
  const header = (
    <div>
      <DJStatus />
      <div className="mt-2">
        <MoodIndicator />
      </div>
    </div>
  );

  // Main: Vinyl + Time + Weather
  const main = (
    <div className="flex flex-col items-center gap-4">
      {/* Time */}
      <TimeDisplay />

      {/* Vinyl Disc */}
      <div className="w-full py-4">
        <VinylDisc />
      </div>

      {/* Weather */}
      <WeatherWidget />

      {/* Chat Panel */}
      <div className="w-full mt-2">
        <ChatPanel />
      </div>
    </div>
  );

  // Player bar
  const player = <PlayerBar />;

  // Chat input
  const chat = (
    <ChatInput
      onSend={handleSend}
      placeholder="和夜汐说点什么..."
    />
  );

  return <AppShell header={header} main={main} player={player} chat={chat} />;
}
