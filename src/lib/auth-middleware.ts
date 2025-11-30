// Simple client-side auth middleware for demo purposes
// In production, you'd use NextAuth.js or similar

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  
  const user = localStorage.getItem('user');
  return !!user;
}

export function getCurrentUser() {
  if (typeof window === 'undefined') return null;
  
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function logout() {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('user');
  localStorage.removeItem('currentProfile');
  window.location.href = '/auth';
}

export function requireAuth<T extends (...args: any[]) => any>(
  component: T
): T {
  return ((...args: any[]) => {
    if (!isAuthenticated()) {
      if (typeof window !== 'undefined') {
        window.location.href = '/auth';
      }
      return null;
    }
    
    return component(...args);
  }) as T;
}
