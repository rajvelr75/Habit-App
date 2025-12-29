import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getTasks, getAllUserCompletions } from "../services/db";
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line
} from "recharts";

export default function Analytics() {
    const { currentUser } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [completions, setCompletions] = useState({}); // { taskId: [dates] }
    const [loading, setLoading] = useState(true);
    const [range, setRange] = useState("month"); // "month", "30days"
    const [selectedMomentumTask, setSelectedMomentumTask] = useState("");

    useEffect(() => {
        if (currentUser) {
            loadData();
        }
    }, [currentUser]);

    // Set default selected task once tasks are loaded
    useEffect(() => {
        if (tasks.length > 0 && !selectedMomentumTask) {
            setSelectedMomentumTask(tasks[0].id);
        }
    }, [tasks]);

    const loadData = async () => {
        setLoading(true);
        const userTasks = await getTasks(currentUser.uid);
        setTasks(userTasks);
        const history = await getAllUserCompletions(currentUser.uid, userTasks);
        setCompletions(history);
        setLoading(false);
    };

    if (loading) return <div className="p-8">Loading analytics...</div>;

    // --- Calculations ---

    const endDate = new Date();
    let startDate = new Date();

    if (range === "month") {
        startDate = startOfMonth(new Date());
    } else {
        startDate = subDays(new Date(), 30);
    }

    const daysInterval = eachDayOfInterval({ start: startDate, end: endDate });

    // 1. Completion Data for Chart
    const chartData = daysInterval.map(date => {
        const dateStr = format(date, "yyyy-MM-dd");
        let count = 0;
        tasks.forEach(task => {
            if (completions[task.id]?.includes(dateStr)) {
                count++;
            }
        });
        return {
            date: format(date, "d MMM"),
            fullDate: dateStr,
            completed: count
        };
    });

    // 2. Best Performing Date
    const bestDay = chartData.reduce((prev, current) => (prev.completed > current.completed) ? prev : current, { completed: 0 });

    // 3. Most Skipped Task (Lowest completion % in period)
    // We need to count completions per task WITHIN interval.
    let worstTask = { name: "-", rate: 100 };
    let bestTask = { name: "-", rate: -1 };

    tasks.forEach(task => {
        const taskDates = completions[task.id] || [];
        // Count how many range days are in taskDates
        const count = daysInterval.filter(d => taskDates.includes(format(d, "yyyy-MM-dd"))).length;
        const rate = (count / daysInterval.length) * 100;

        if (rate < worstTask.rate) worstTask = { name: task.name, rate };
        if (rate > bestTask.rate) bestTask = { name: task.name, rate };
    });

    // 4. Average Completion
    const totalPossible = tasks.length * daysInterval.length;
    const totalActual = chartData.reduce((acc, curr) => acc + curr.completed, 0);
    const avgCompletion = totalPossible > 0 ? Math.round((totalActual / totalPossible) * 100) : 0;

    // 5. Momentum Calculation
    // Start score = 0. For each day: +1 if done, -1 if not.
    let currentScore = 0;
    const momentumData = daysInterval.map(date => {
        const dateStr = format(date, "yyyy-MM-dd");
        // Check selected task
        if (selectedMomentumTask && completions[selectedMomentumTask]) {
            const isDone = completions[selectedMomentumTask].includes(dateStr);
            if (isDone) currentScore += 1;
            else currentScore -= 1;
        }
        return {
            date: format(date, "d MMM"),
            score: currentScore
        };
    });

    return (
        <div className="p-4 lg:p-8 max-w-5xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Analytics</h1>
                <select
                    value={range}
                    onChange={(e) => setRange(e.target.value)}
                    className="bg-white/10 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/50"
                >
                    <option value="month">This Month</option>
                    <option value="30days">Last 30 Days</option>
                </select>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                    <p className="text-sm text-gray-400 mb-1">Best Day</p>
                    <p className="text-2xl font-bold">{bestDay.completed > 0 ? bestDay.date : "-"}</p>
                    <p className="text-xs text-gray-500">{bestDay.completed} tasks completed</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                    <p className="text-sm text-gray-400 mb-1">Completion Rate</p>
                    <p className="text-2xl font-bold">{avgCompletion}%</p>
                    <p className="text-xs text-gray-500">Average for period</p>
                </div>
                <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                    <p className="text-sm text-gray-400 mb-1">Most Consistent</p>
                    <p className="text-xl font-bold truncate">{bestTask.name}</p>
                    <p className="text-xs text-gray-500">{Math.round(bestTask.rate)}% consistency</p>
                </div>
            </div>

            {/* Chart */}
            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-6">Activity Trend</h3>
                <div className="h-64 w-full" style={{ minHeight: '16rem' }}>
                    <ResponsiveContainer width="100%" height="100%" minWidth={100}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                            <XAxis
                                dataKey="date"
                                stroke="#666"
                                tick={{ fill: '#999', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                stroke="#666"
                                tick={{ fill: '#999', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1E1E2E', border: 'none', borderRadius: '8px' }}
                                itemStyle={{ color: '#fff' }}
                                cursor={{ fill: '#ffffff10' }}
                            />
                            <Bar dataKey="completed" fill="#818CF8" radius={[4, 4, 0, 0]} maxBarSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* NEW: Habit Momentum Graph */}
            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                    <h3 className="text-lg font-semibold">Habit Momentum</h3>
                    {tasks.length > 0 ? (
                        <select
                            value={selectedMomentumTask}
                            onChange={(e) => setSelectedMomentumTask(e.target.value)}
                            className="bg-black/20 border border-white/10 rounded-lg px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-primary/50 text-white"
                        >
                            {tasks.map(t => <option key={t.id} value={t.id} className="bg-gray-900">{t.name}</option>)}
                        </select>
                    ) : (
                        <span className="text-sm text-gray-500">No habits found</span>
                    )}
                </div>

                {/* Fixed height container to prevent Recharts width(-1) error */}
                <div className="w-full" style={{ height: 300, minHeight: 300 }}>
                    {tasks.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                            <LineChart data={momentumData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#666"
                                    tick={{ fill: '#999', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <YAxis
                                    stroke="#666"
                                    tick={{ fill: '#999', fontSize: 12 }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1E1E2E', border: 'none', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                    cursor={{ stroke: '#ffffff20' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#22C55E"
                                    strokeWidth={3}
                                    dot={{ fill: '#1E1E2E', stroke: '#22C55E', strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: '#22C55E' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            Create a habit to view momentum
                        </div>
                    )}
                </div>


            </div>


            {/* NEW: Habit Performance Table */}
            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-6">Habit Breakdown</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/10 text-gray-400">
                                <th className="pb-3 pl-2">Habit</th>
                                <th className="pb-3">Success Rate</th>
                                <th className="pb-3">Completions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {tasks.map(task => {
                                const taskDates = completions[task.id] || [];
                                const count = daysInterval.filter(d => taskDates.includes(format(d, "yyyy-MM-dd"))).length;
                                const rate = Math.round((count / daysInterval.length) * 100);
                                return (
                                    <tr key={task.id} className="hover:bg-white/5 transition-colors">
                                        <td className="py-3 pl-2 font-medium">{task.name}</td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${rate}%` }} />
                                                </div>
                                                <span className="text-xs text-gray-400">{rate}%</span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-gray-400">{count} / {daysInterval.length}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Heatmap-ish Grid (Last 30 Days) */}
            <div className="bg-white/5 border border-white/5 p-6 rounded-2xl">
                <h3 className="text-lg font-semibold mb-6">Consistency Heatmap (Last 30 Days)</h3>
                <div className="grid grid-cols-7 gap-2">
                    {[...daysInterval].reverse().map(date => {
                        const dateStr = format(date, "yyyy-MM-dd");
                        // Calculate completion opacity based on % of tasks done that day
                        let completedOnDay = 0;
                        tasks.forEach(task => {
                            if (completions[task.id]?.includes(dateStr)) completedOnDay++;
                        });
                        const intensity = tasks.length > 0 ? (completedOnDay / tasks.length) : 0;

                        // Color scale
                        let bgClass = "bg-white/5";
                        if (intensity > 0) bgClass = "bg-green-900";
                        if (intensity > 0.3) bgClass = "bg-green-700";
                        if (intensity > 0.6) bgClass = "bg-green-500";
                        if (intensity > 0.9) bgClass = "bg-green-400";

                        return (
                            <div key={dateStr} className="flex flex-col items-center">
                                <div
                                    title={`${dateStr}: ${completedOnDay}/${tasks.length}`}
                                    className={`h-8 w-8 rounded-md flex items-center justify-center text-xs font-medium cursor-default transition-colors ${bgClass}`}
                                >
                                    {format(date, "d")}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

        </div >
    );
}
