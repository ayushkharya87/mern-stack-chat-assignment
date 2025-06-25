export const getValidSession = (key) => {
  const session = localStorage.getItem(key);
  if (!session) return null;

  try {
    const parsed = JSON.parse(session);
    const loginTime = parsed.timestamp;
    const now = Date.now();
    const maxSessionAge = 24 * 60 * 60 * 1000; 

    if (now - loginTime < maxSessionAge) {
      return parsed.user; 
    } else {
      localStorage.removeItem(key);
      return null;
    }
  } catch {
    return null;
  }
};
