/**
 * Returns a human-readable relative time string for the given date.
 *
 * If the date is within the past or next 7 days, the result is a relative time (e.g., "3 minutes ago", "in 2 days"). For dates beyond 7 days, the result is formatted as a short month and day (e.g., "Apr 27").
 *
 * @param date - The date to format relative to the current time
 * @returns A string representing the relative time or formatted date
 */
export function formatTime(date: Date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });

  if (Math.abs(diffInSeconds) < 60) {
    return rtf.format(-diffInSeconds, 'second');
  }
  if (Math.abs(diffInSeconds) < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
  }
  if (Math.abs(diffInSeconds) < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour');
  }
  if (Math.abs(diffInSeconds) < 604800) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day');
  }

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
