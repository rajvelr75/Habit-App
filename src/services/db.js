import { db } from "../firebase";
import {
    collection,
    addDoc,
    deleteDoc,
    doc,
    getDocs,
    getDoc,
    query,
    setDoc,
    orderBy,
    serverTimestamp,
    where,
    writeBatch
} from "firebase/firestore";
import { format, subDays, addDays, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth } from "date-fns";

// --- Tasks ---

export async function getTasks(uid) {
    if (!uid) return [];
    const q = query(collection(db, `users/${uid}/tasks`), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function createTask(uid, name) {
    if (!uid || !name) throw new Error("Missing uid or name");
    await addDoc(collection(db, `users/${uid}/tasks`), {
        name,
        createdAt: serverTimestamp()
    });
}

export async function deleteTask(uid, taskId) {
    if (!uid || !taskId) throw new Error("Missing uid or taskId");
    await deleteDoc(doc(db, `users/${uid}/tasks`, taskId));
}

// --- Completions ---

export async function getTaskHistory(uid, taskId) {
    // Fetch all completions for streak calc
    if (!uid || !taskId) return [];
    const q = query(collection(db, `users/${uid}/taskCompletions/${taskId}/history`));
    const snapshot = await getDocs(q);
    // Return array of date strings
    return snapshot.docs.map(doc => doc.id);
}

export async function toggleTaskCompletion(uid, taskId, date, isCompleted) {
    // Path: users/${uid}/taskCompletions/${taskId}/history/${date}
    if (!uid || !taskId || !date) return;

    const docRef = doc(db, `users/${uid}/taskCompletions/${taskId}/history`, date);
    if (isCompleted) {
        await setDoc(docRef, { completed: true });
    } else {
        // Check if doc exists? deleteDoc is safe even if not exists.
        await deleteDoc(docRef);
    }
}

export async function getAllUserCompletions(uid, tasks) {
    // Helper for Analytics: fetch all history for ALL tasks.
    // Returns { taskId: Set(dates) }
    const historyMap = {};
    await Promise.all(tasks.map(async (task) => {
        const dates = await getTaskHistory(uid, task.id);
        historyMap[task.id] = dates; // Array
    }));
    return historyMap;
}
// --- Badges ---

export const getUserBadges = async (uid) => {
    try {
        const badgesRef = collection(db, "users", uid, "monthlyBadges");
        const snapshot = await getDocs(badgesRef);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error fetching badges:", error);
        return [];
    }
};

export const checkAndGrantMonthlyBadge = async (uid) => {
    // Check previous month
    const today = new Date();
    const prevMonthDate = subDays(startOfMonth(today), 1); // Last day of prev month
    const badgeId = format(prevMonthDate, "yyyy-MM");

    // Check if badge already exists
    const badgeRef = doc(db, "users", uid, "monthlyBadges", badgeId);
    const badgeSnap = await getDoc(badgeRef);
    if (badgeSnap.exists()) return; // Already processed

    // Logic: Every existing task must be completed on every single day of that month.
    const start = startOfMonth(prevMonthDate);
    const end = endOfMonth(prevMonthDate);
    const daysInMonth = eachDayOfInterval({ start, end });

    // Get all tasks
    const tasks = await getTasks(uid);
    if (tasks.length === 0) return; // No tasks == No badge

    const completionsRef = collection(db, "users", uid, "completions");

    let perfectMonth = true;

    for (const task of tasks) {
        const historyRef = collection(db, "users", uid, "taskCompletions", task.id, "history");

        const q = query(historyRef, where("__name__", ">=", format(start, "yyyy-MM-dd")), where("__name__", "<=", format(end, "yyyy-MM-dd")));
        const snap = await getDocs(q);
        const completedDays = new Set(snap.docs.map(d => d.id));

        // Check if every expected day is in completedDays
        const allDaysDone = daysInMonth.every(day => completedDays.has(format(day, "yyyy-MM-dd")));

        if (!allDaysDone) {
            perfectMonth = false;
            break;
        }
    }

    if (perfectMonth) {
        await setDoc(badgeRef, {
            earned: true,
            earnedAt: new Date().toISOString()
        });

    }
};
