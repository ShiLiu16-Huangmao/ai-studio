// @ai-radio/shared — WebSocket event name constants

export const ClientEvents = {
  CHAT_MESSAGE: 'chat:message',
  CHAT_TYPING: 'chat:typing',
  CHAT_STOP: 'chat:stop',
  PLAYER_ACTION: 'player:action',
  PLAYER_SYNC: 'player:sync',
  PLAYER_QUEUE: 'player:queue',
  USER_PRESENCE: 'user:presence',
  USER_PREFERENCE: 'user:preference',
  PING: 'ping',
} as const;

export type ClientEventType = (typeof ClientEvents)[keyof typeof ClientEvents];

export const ServerEvents = {
  CONNECTED: 'connected',
  CHAT_TOKEN: 'chat:token',
  CHAT_DONE: 'chat:done',
  CHAT_ACTION: 'chat:action',
  AUDIO_START: 'audio:start',
  AUDIO_CHUNK: 'audio:chunk',
  AUDIO_END: 'audio:end',
  MUSIC_TRACK: 'music:track',
  MUSIC_PLAYLIST: 'music:playlist',
  WEATHER_UPDATE: 'weather:update',
  SCHEDULE_UPDATE: 'schedule:update',
  DJ_STATE: 'dj:state',
  DJ_MOOD: 'dj:mood',
  SYSTEM_EVENT: 'system:event',
  ERROR: 'error',
  PONG: 'pong',
} as const;

export type ServerEventType = (typeof ServerEvents)[keyof typeof ServerEvents];

export const ALL_EVENTS = { ...ClientEvents, ...ServerEvents } as const;
