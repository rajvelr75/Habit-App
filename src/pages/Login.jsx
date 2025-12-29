import { useAuth } from "../contexts/AuthContext";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
    const { login, currentUser } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser) {
            navigate("/", { replace: true });
        }
    }, [currentUser, navigate]);

    const handleLogin = async () => {
        try {
            setLoading(true);
            await login();
        } catch (err) {
            setError("Failed to sign in. Please try again.");
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-950 relative overflow-hidden">
            {/* Subtle Texture Background */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

            {/* Ambient Lighting - aligned with Gold/Metal theme */}
            <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-yellow-600/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-zinc-600/10 rounded-full blur-[120px] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md p-8 relative z-10"
            >
                {/* Glass Card - Darker, Metallic */}
                <div className="backdrop-blur-xl bg-zinc-900/80 border border-white/10 p-8 rounded-3xl shadow-2xl shadow-black relative overflow-hidden">
                    {/* Inner sheen */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />

                    <div className="text-center mb-8 relative z-10">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="w-16 h-16 bg-gradient-to-br from-zinc-800 to-black border border-white/10 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg group"
                        >
                            <svg className="w-8 h-8 text-yellow-500/80 group-hover:text-yellow-400 transition-colors duration-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </motion.div>

                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white via-zinc-200 to-zinc-500 mb-2 tracking-tight">
                            Habit App
                        </h1>
                        <p className="text-zinc-500 text-sm font-medium tracking-wide uppercase opacity-70">
                            Master Your Discipline
                        </p>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mb-6 p-4 bg-red-900/20 border border-red-900/30 rounded-xl text-red-200 text-sm text-center relative z-10"
                        >
                            {error}
                        </motion.div>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogin}
                        disabled={loading}
                        className="w-full bg-white text-black font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-all hover:bg-zinc-200 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-70 disabled:cursor-not-allowed group relative z-10"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                <span>Continue with Google</span>
                            </>
                        )}
                    </motion.button>

                    <div className="mt-8 text-center relative z-10">
                        <div className="flex items-center justify-center gap-2 mb-2 opacity-30">
                            <div className="h-px w-8 bg-white/50"></div>
                            <div className="h-1 w-1 rounded-full bg-white/50"></div>
                            <div className="h-px w-8 bg-white/50"></div>
                        </div>
                        <p className="text-[10px] text-zinc-600 uppercase tracking-widest">
                            Secure Access
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
