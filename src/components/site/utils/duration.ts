export const getDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const ms = endDate.getTime() - startDate.getTime();
    const totalMinutes = Math.floor(ms / 1000 / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
  
    const hourStr = hours > 0 ? `${hours}h` : "";
    const minuteStr = minutes > 0 ? `${minutes}m` : "";
  
    if (!hourStr && !minuteStr) return "0m";
  
    return [hourStr, minuteStr].filter(Boolean).join(" ");
}