// @ai-radio/web — Root App component

import type { ReactElement } from 'react';

export function App(): ReactElement {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-950 to-black">
      <header className="text-center">
        <h1 className="text-4xl font-light tracking-widest text-white/90">AI Radio</h1>
        <p className="mt-3 text-sm text-white/40">个人 AI 电台</p>
      </header>

      <main className="mt-8 flex flex-col items-center gap-4">
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
          <span className="text-5xl">🎙️</span>
        </div>
        <p className="text-sm text-white/30">Phase 1 · 项目骨架已就绪</p>
      </main>

      <footer className="mt-auto pb-8">
        <p className="text-xs text-white/20">
          {new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </footer>
    </div>
  );
}
