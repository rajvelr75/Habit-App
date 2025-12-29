import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getTasks, getTaskHistory } from "../services/db";
import { calculateStreak } from "../utils/streak";
import { Flame } from "lucide-react";
import clsx from "clsx";

export default function Streak() {
    const { currentUser } = useAuth();
    const [streaks, setStreaks] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser) {
            loadStreaks();
        }
    }, [currentUser]);

    const loadStreaks = async () => {
        setLoading(true);
        try {
            const tasks = await getTasks(currentUser.uid);
            const streakData = await Promise.all(tasks.map(async (task) => {
                const history = await getTaskHistory(currentUser.uid, task.id);
                const currentStreak = calculateStreak(history);
                return {
                    ...task,
                    streak: currentStreak
                };
            }));

            // Sort by streak (descending)
            setStreaks(streakData.sort((a, b) => b.streak - a.streak));
        } catch (error) {
            console.error("Failed to load streaks", error);
        } finally {
            setLoading(false);
        }
    };

    const getFireColor = (streak) => {
        if (streak === 0) return "text-gray-500";
        if (streak < 10) return "text-orange-400";
        if (streak < 50) return "text-red-500";
        if (streak < 100) return "text-purple-500";
        if (streak < 200) return "text-blue-500";
        return "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.8)]"; // Gold for 200+
    };

    const getBgColor = (streak) => {
        if (streak === 0) return "bg-gray-500/10 border-gray-500/10";
        if (streak < 10) return "bg-orange-500/10 border-orange-500/20";
        if (streak < 50) return "bg-red-500/10 border-red-500/20";
        if (streak < 100) return "bg-purple-500/10 border-purple-500/20";
        if (streak < 200) return "bg-blue-500/10 border-blue-500/20";
        return "bg-yellow-500/10 border-yellow-500/20";
    };

    const getLabel = (streak) => {
        if (streak === 0) return "No Streak";
        if (streak < 10) return "Warming Up";
        if (streak < 50) return "On Fire";
        if (streak < 100) return "Unstoppable";
        if (streak < 200) return "Master";
        return "Legendary";
    };

    if (loading) return <div className="p-8 text-center text-gray-400">Calculating streaks...</div>;

    return (
        <div className="p-4 lg:p-8 max-w-5xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Streak Leaderboard</h1>
                <p className="text-gray-400 mt-2">Keep the fire burning! Consistency is key.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {streaks.map((task) => (
                    <div
                        key={task.id}
                        className={clsx(
                            "relative p-6 rounded-2xl border transition-all hover:scale-[1.02] hover:shadow-lg",
                            getBgColor(task.streak)
                        )}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className={clsx("p-3 rounded-xl bg-background/50 backdrop-blur-sm", getFireColor(task.streak))}>
                                <Flame size={32} fill="currentColor" strokeWidth={1.5} />
                            </div>
                            <span className={clsx("text-xs font-bold px-2 py-1 rounded-full bg-background/50", getFireColor(task.streak))}>
                                {getLabel(task.streak)}
                            </span>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold mb-1 truncate" title={task.name}>{task.name}</h3>
                            <div className="flex items-baseline gap-2">
                                <span className={clsx("text-4xl font-extrabold", getFireColor(task.streak))}>
                                    {task.streak}
                                </span>
                                <span className="text-gray-400 font-medium">days</span>
                            </div>
                        </div>
                    </div>
                ))}

                {streaks.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                        <Flame size={48} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-400">No active habits</h3>
                        <p className="text-gray-500 mt-2">Start a habit to build your streak!</p>
                    </div>
                )}
            </div>
        </div>
    );
}
