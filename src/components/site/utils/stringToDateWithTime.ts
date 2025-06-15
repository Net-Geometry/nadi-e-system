export const stringToDateWithTime = (timeString: string, day?: Date): Date => {
    try {
        // Parse the time string
        const [hours, minutes] = timeString.split(":").map(Number);
        
        if (isNaN(hours) || isNaN(minutes)) {
            throw new Error('Invalid time format. Expected HH:mm');
        }

        // Create date from the provided day or use current date
        const dateWithTime = day ? new Date(day) : new Date();

        // Set the time components
        dateWithTime.setHours(hours);
        dateWithTime.setMinutes(minutes);
        dateWithTime.setSeconds(0);
        dateWithTime.setMilliseconds(0);

        // Validate the resulting date
        if (isNaN(dateWithTime.getTime())) {
            throw new Error('Invalid date result');
        }

        return dateWithTime;
    } catch (error) {
        console.error('Error in stringToDateWithTime:', error);
        throw error;
    }
}