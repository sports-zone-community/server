import { LOCALE, TIME_FORMAT_OPTIONS } from '../consts/timeFormatOptions';

export const formatMessageTime = (timestamp: Date): string => {
    return timestamp.toLocaleTimeString(LOCALE, TIME_FORMAT_OPTIONS);
 }