export const stringToDateWithTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number);

    // Date with time
    const now = new Date();
    const dateWithTime = new Date(now);

    dateWithTime.setHours(hours);
    dateWithTime.setMinutes(minutes);
    dateWithTime.setSeconds(0);
    dateWithTime.setMilliseconds(0);

    return dateWithTime;
}