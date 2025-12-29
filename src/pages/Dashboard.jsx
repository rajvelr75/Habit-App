import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getTasks, toggleTaskCompletion, getTaskHistory } from "../services/db";
import { calculateStreak } from "../utils/streak";
import { format, subDays, addDays, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight, CheckCircle, Circle, Flame } from "lucide-react";
import clsx from "clsx";

export default function Dashboard() {
    const { currentUser, logout } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [completions, setCompletions] = useState({}); // { taskId: Set(dates) }
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [editMode, setEditMode] = useState(false);
    const [loading, setLoading] = useState(true);

    const dateKey = format(selectedDate, "yyyy-MM-dd");
    const isToday = isSameDay(selectedDate, new Date());

    useEffect(() => {
        if (currentUser) {
            loadData();
        }
    }, [currentUser]);

    const loadData = async () => {
        setLoading(true);
        const userTasks = await getTasks(currentUser.uid);
        setTasks(userTasks);

        // Fetch history for all tasks (for streak and today's status)
        const historyMap = {};
        await Promise.all(userTasks.map(async (task) => {
            const history = await getTaskHistory(currentUser.uid, task.id);
            historyMap[task.id] = new Set(history);
        }));

        setCompletions(historyMap);
        setLoading(false);
    };

    const handleToggle = async (taskId) => {
        if (!currentUser) return;

        // Optimistic update
        const currentSet = completions[taskId] || new Set();
        const isCompleted = currentSet.has(dateKey);
        const newSet = new Set(currentSet);

        if (isCompleted) {
            newSet.delete(dateKey);
        } else {
            newSet.add(dateKey);
        }

        setCompletions(prev => ({ ...prev, [taskId]: newSet }));

        try {
            await toggleTaskCompletion(currentUser.uid, taskId, dateKey, !isCompleted);
        } catch (error) {
            console.error("Failed to toggle task", error);
            // Revert if failed
            setCompletions(prev => ({ ...prev, [taskId]: currentSet }));
        }
    };

    const changeDate = (days) => {
        setSelectedDate(prev => addDays(prev, days));
    };

    // Metrics Calculation
    const tasksCount = tasks.length;
    const completedCount = tasks.filter(t => completions[t.id]?.has(dateKey)).length;
    const progress = tasksCount > 0 ? Math.round((completedCount / tasksCount) * 100) : 0;

    // Streak Calculation
    let maxStreak = 0;
    let maxStreakTask = null;

    tasks.forEach(task => {
        const history = Array.from(completions[task.id] || []);
        const streak = calculateStreak(history);
        if (streak > maxStreak) {
            maxStreak = streak;
            maxStreakTask = task.name;
        }
    });

    if (loading) return <div className="p-8">Loading dashboard...</div>;

    return (
        <div className="p-4 lg:p-8 max-w-4xl mx-auto space-y-8">

            {/* Top Section */}
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold">Good {new Date().getHours() < 12 ? "Morning" : "Evening"}, {currentUser?.displayName?.split(' ')[0]}</h1>
                    <p className="text-gray-400 text-sm mt-1">{format(new Date(), "EEEE, MMMM do")}</p>
                </div>

                {/* Metric Cards */}
                <div className="flex gap-4 w-full md:w-auto">
                    {/* Streak Card */}
                    {maxStreak > 0 && (
                        <div className="bg-orange-500/10 border border-orange-500/20 px-4 py-3 rounded-xl flex items-center gap-3 flex-1 md:flex-none">
                            <div className="bg-orange-500/20 p-2 rounded-lg text-orange-500">
                                <Flame size={20} fill="currentColor" />
                            </div>
                            <div>
                                <p className="text-xs text-orange-200 font-medium uppercase tracking-wider">Top Streak</p>
                                <p className="font-bold text-orange-100">{maxStreakTask} <span className="text-orange-300 mx-1">•</span> {maxStreak} days</p>
                            </div>
                        </div>
                    )}

                    {/* Progress Card */}
                    <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-3 rounded-xl flex items-center gap-3 flex-1 md:flex-none">
                        <div className="relative h-10 w-10 flex items-center justify-center">
                            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
                                <path className="text-blue-900" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                                <path className="text-blue-500 transition-all duration-500" strokeDasharray={`${progress}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                            </svg>
                            <span className="absolute text-xs font-bold">{progress}%</span>
                        </div>
                        <div>
                            <p className="text-xs text-blue-200 font-medium uppercase tracking-wider">Daily Goal</p>
                            <p className="font-bold text-blue-100">{completedCount}/{tasksCount} Done</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Date Navigation (Edit Past Days) */}
            <div className="flex items-center justify-between bg-white/5 border border-white/5 p-4 rounded-xl">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-semibold">
                        {isToday ? "Today's Tasks" : `Tasks for ${format(selectedDate, "MMM do")}`}
                    </h2>
                    {isToday && !editMode && (
                        <button
                            onClick={() => setEditMode(true)}
                            className="text-xs bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition"
                        >
                            Edit Past
                        </button>
                    )}
                </div>

                {(editMode || !isToday) && (
                    <div className="flex items-center gap-2 bg-black/20 rounded-lg p-1">
                        <button onClick={() => changeDate(-1)} className="p-1 hover:text-white text-gray-400"><ChevronLeft size={20} /></button>
                        <span className="text-sm font-mono w-24 text-center">{format(selectedDate, "yyyy-MM-dd")}</span>
                        <button onClick={() => changeDate(1)} disabled={isToday} className="p-1 hover:text-white text-gray-400 disabled:opacity-30"><ChevronRight size={20} /></button>
                        {isToday && (
                            <button onClick={() => setEditMode(false)} className="ml-2 text-xs text-red-400 hover:text-red-300">Close</button>
                        )}
                    </div>
                )}
            </div>

            {/* Task List */}
            <div className="space-y-3">
                {tasks.map(task => {
                    const isCompleted = completions[task.id]?.has(dateKey);
                    return (
                        <div
                            key={task.id}
                            onClick={() => handleToggle(task.id)}
                            className={clsx(
                                "group flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer select-none",
                                isCompleted
                                    ? "bg-green-500/10 border-green-500/20 text-green-100"
                                    : "bg-white/5 border-white/5 hover:bg-white/10 text-gray-200"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={clsx(
                                    "h-6 w-6 rounded-full flex items-center justify-center border transition-colors",
                                    isCompleted ? "bg-green-500 border-green-500" : "border-gray-500 group-hover:border-gray-300"
                                )}>
                                    {isCompleted && <CheckCircle size={14} className="text-black" strokeWidth={3} />}
                                </div>
                                <span className={clsx("font-medium text-lg", isCompleted && "line-through opacity-70")}>
                                    {task.name}
                                </span>
                            </div>
                        </div>
                    );
                })}

                {tasks.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        No habits set up yet. Go to <a href="/tasks" className="underline text-white">Tasks</a> to add some!
                    </div>
                )}
            </div>

        </div>
    );
}
