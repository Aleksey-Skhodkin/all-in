let _accessToken: string | null = null;
const listeners = new Set<() => void>();

export const getAccessToken = () => _accessToken;
export const setAccessToken = (t: string | null) => {
  _accessToken = t;
  listeners.forEach((l) => l());
};
export const clearAccessToken = () => setAccessToken(null);
export const subscribeAccessToken = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
