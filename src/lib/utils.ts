export function formatInterval(seconds: number): string {
  if (seconds < 3600) {
    return `${Math.round(seconds / 60)} min`;
  } else if (seconds < 86400) {
    const hours = Math.round(seconds / 3600);
    return hours === 1 ? '1 hour' : `${hours} hours`;
  } else {
    const days = Math.round(seconds / 86400);
    return days === 1 ? '1 day' : `${days} days`;
  }
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const then = new Date(date);
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  
  return then.toLocaleDateString();
}

export function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url;
  
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    const remaining = maxLength - hostname.length - 5; // 5 for "..." and some path
    
    if (remaining <= 0) {
      return hostname.substring(0, maxLength - 3) + '...';
    }
    
    const path = parsed.pathname + parsed.search;
    if (path.length <= remaining) {
      return hostname + path;
    }
    
    return hostname + path.substring(0, remaining) + '...';
  } catch {
    return url.substring(0, maxLength - 3) + '...';
  }
}
