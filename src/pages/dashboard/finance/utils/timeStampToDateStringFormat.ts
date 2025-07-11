import { getMonthNameByNumber } from "./getMonthNameByNumber";

getMonthNameByNumber
export const timeStampToDateStringFormat = (timestamp: string) => {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${getMonthNameByNumber(Number(month))} ${day}, ${year} at ${date.getHours()}:${date.getMinutes()}`;
};