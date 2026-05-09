// @ai-radio/web — WebSocket connection hook
// ===================================================================

import { useEffect } from 'react';
import { wsClient } from '../services/wsClient';

/**
 * Auto-connect WebSocket on mount, disconnect on unmount.
 * For development: runs in mock mode so no server is needed.
 */
export function useWebSocket(useMock = true): void {
  useEffect(() => {
    if (useMock) {
      wsClient.enableMockMode();
    } else {
      wsClient.connect();
    }

    return () => {
      wsClient.disconnect();
    };
  }, [useMock]);
}
