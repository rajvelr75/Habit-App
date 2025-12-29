import { differenceInDays, parseISO, subDays, format } from "date-fns";

export function calculateStreak(historyDates) {
    if (!historyDates || historyDates.length === 0) return 0;

    const completionSet = new Set(historyDates);
    let streak = 0;

    // Start checking from Today
    let datePointer = new Date();

    // Logic: 
    // 1. If Today is done, start counting from Today.
    // 2. If Today is NOT done, but Yesterday IS done, start counting from Yesterday.
    // 3. If neither, streak is 0.

    let isTodayDone = completionSet.has(format(datePointer, "yyyy-MM-dd"));

    if (!isTodayDone) {
        // Move pointer to yesterday
        datePointer = subDays(datePointer, 1);
        let isYesterdayDone = completionSet.has(format(datePointer, "yyyy-MM-dd"));
        if (!isYesterdayDone) return 0;
    }

    // Now count backwards consecutively
    while (true) {
        const dStr = format(datePointer, "yyyy-MM-dd");
        if (completionSet.has(dStr)) {
            streak++;
            datePointer = subDays(datePointer, 1);
        } else {
            break;
        }
    }

    return streak;
}
