import { v4 as uuidv4 } from 'uuid';

const SESSION_KEY = 'psSessionId';

/**
 * useSession
 *
 * Returns a stable sessionId for the current browser.
 * - On first call: generates a uuid v4, stores it in localStorage, returns it.
 * - On subsequent calls (including after browser close/reopen): reads the
 *   stored value and returns it unchanged.
 * - The ID is only lost if the user clears localStorage / site data.
 */
export function useSession() {
  let sessionId = localStorage.getItem(SESSION_KEY);

  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_KEY, sessionId);
  }

  return sessionId;
}
