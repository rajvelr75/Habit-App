import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { getTasks, createTask, deleteTask } from "../services/db";
import { Trash2, Plus } from "lucide-react";

export default function Tasks() {
    const { currentUser } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [newTaskName, setNewTaskName] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTasks();
    }, [currentUser]);

    const fetchTasks = async () => {
        if (currentUser) {
            const data = await getTasks(currentUser.uid);
            setTasks(data);
            setLoading(false);
        }
    };

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTaskName.trim() || !currentUser) return;

        try {
            await createTask(currentUser.uid, newTaskName.trim());
            setNewTaskName("");
            fetchTasks(); // Refresh list - efficient enough for personal usage
        } catch (error) {
            console.error("Error creating task:", error);
        }
    };

    const handleDeleteTask = async (taskId) => {
        if (!currentUser) return;
        if (confirm("Are you sure you want to delete this habit? History will be preserved but the habit will be gone.")) {
            try {
                await deleteTask(currentUser.uid, taskId);
                fetchTasks();
            } catch (error) {
                console.error("Error deleting task:", error);
            }
        }
    };

    if (loading) return <div className="p-8">Loading...</div>;

    return (
        <div className="p-4 lg:p-8 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">My Habits</h1>

            {/* Add Task Form */}
            <form onSubmit={handleAddTask} className="flex gap-4 mb-8">
                <input
                    type="text"
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    placeholder="New habit name (e.g., Drink water)"
                    className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-gray-500"
                />
                <button
                    type="submit"
                    className="bg-white text-black font-semibold px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                    disabled={!newTaskName.trim()}
                >
                    <Plus size={18} /> Add
                </button>
            </form>

            {/* Tasks List */}
            <div className="space-y-4">
                {tasks.length === 0 ? (
                    <div className="text-center py-12 text-gray-500 border border-white/5 rounded-xl bg-white/5">
                        <p className="mb-4">No tasks yet.</p>
                        <p className="text-sm">Add your first task to get started!</p>
                    </div>
                ) : (
                    tasks.map((task) => (
                        <div
                            key={task.id}
                            className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all"
                        >
                            <span className="font-medium text-lg">{task.name}</span>
                            <button
                                onClick={() => handleDeleteTask(task.id)}
                                className="text-gray-500 hover:text-red-400 p-2 transition-colors"
                                title="Delete task"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
