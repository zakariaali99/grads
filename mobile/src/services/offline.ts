import NetInfo from '@react-native-community/netinfo';

let cachedOnline = true;

NetInfo.addEventListener((state) => {
  cachedOnline = state.isConnected !== false && state.isInternetReachable !== false;
});

export function isOnline(): boolean {
  return cachedOnline;
}

export async function checkOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  cachedOnline = state.isConnected !== false && state.isInternetReachable !== false;
  return cachedOnline;
}

export async function withOfflineFallback<T>(
  apiCall: () => Promise<{ data: T }>,
  fallback: T,
): Promise<{ data: T }> {
  const online = await checkOnline();
  if (!online) {
    return { data: fallback };
  }
  try {
    return await apiCall();
  } catch {
    return { data: fallback };
  }
}
