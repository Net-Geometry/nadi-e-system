/**
 * Formats a duration in hours to a readable format
 * @param hours Duration in hours
 * @returns Formatted duration string
 */
export const formatDuration = (hours: number): string => {
  if (hours === 0) {
    return "0h";
  }

  if (hours < 1) {
    const minutes = Math.round(hours * 60);
    return `${minutes}m`;
  }

  if (Number.isInteger(hours)) {
    return `${hours}h`;
  }

  const wholeHours = Math.floor(hours);
  const minutes = Math.round((hours - wholeHours) * 60);

  if (minutes === 0) {
    return `${wholeHours}h`;
  }

  return `${wholeHours}h ${minutes}m`;
};

/**
 * Formats a date to a readable format
 * @param date The date to format
 * @returns Formatted date string
 */
export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(dateObj);
};

/**
 * Formats a date to include time
 * @param date The date to format
 * @returns Formatted date string with time
 */
export const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
};

/**
 * Formats a date to include time
 * @param date The date to format
 * @returns Formatted date string with time to locale timezone
 */

export const formatDateTimeLocal = (date: Date | string): string => {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Ensure date is valid
  if (isNaN(dateObj.getTime())) return "Invalid date";

  const localDay = String(dateObj.getDate()).padStart(2, "0");
  const localMonth = String(dateObj.getMonth() + 1).padStart(2, "0");
  const localYear = dateObj.getFullYear();

  let localHours = dateObj.getHours();
  const localMinutes = String(dateObj.getMinutes()).padStart(2, "0");
  const ampm = localHours >= 12 ? "PM" : "AM";
  localHours = localHours % 12 || 12; // Convert 0 to 12

  return `${localDay}/${localMonth}/${localYear} ${localHours}:${localMinutes} ${ampm}`;
};
