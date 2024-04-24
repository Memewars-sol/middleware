import { TransactionInstruction } from '@solana/web3.js';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

const SECONDS_PER_DAY = 86400

export function getTimestampFromDays(days: number) {
    return days * SECONDS_PER_DAY
}

export const formatDuration = (seconds: number) => {
    const dur = dayjs.duration(seconds, 'seconds');
    const years = dur.years();
    const months = dur.months();
    const days = dur.days();
    const hours = dur.hours();
    const minutes = dur.minutes();

    let result = '';
    if (years > 0) {
        result += `${years} yr${years > 1 ? 's' : ''} `;
    }
    if (months > 0) {
        result += `${months} mth${months > 1 ? 's' : ''} `;
    }
    if (days > 0) {
        result += `${days} day${days > 1 ? 's' : ''} `;
    }
    if (hours > 0) {
        result += `${hours} hr${hours > 1 ? 's' : ''} `;
    }
    if (minutes > 0) {
        result += `${minutes} min${minutes > 1 ? 's' : ''} `;
    }
    return result.trim();
}