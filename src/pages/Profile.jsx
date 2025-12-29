import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; // Import Firestore methods
import { db } from "../firebase";
import { encryptData, decryptData } from "../utils/crypto";
import { format } from "date-fns";
import { Avatar } from "../components/ui/Avatar";
import { Save, User, Upload, Image as ImageIcon, Pencil, LogOut } from "lucide-react";

import { checkAndGrantMonthlyBadge, getUserBadges } from "../services/db";
import { Award } from "lucide-react";

// ... inside Profile component

export default function Profile() {
    const { currentUser, logout } = useAuth();
    const [displayName, setDisplayName] = useState("");
    const [photoPreview, setPhotoPreview] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [badges, setBadges] = useState([]);
    const [isEditingName, setIsEditingName] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setDisplayName(currentUser.displayName || "");
            // Initial load handled by AuthContext usually, but for immediate feedback:
            fetchProfileImage();

            // Check for badges and load
            checkAndGrantMonthlyBadge(currentUser.uid).then(() => {
                loadBadges();
            });
        }
    }, [currentUser]);

    const loadBadges = async () => {
        const userBadges = await getUserBadges(currentUser.uid);
        // Sort by date descending
        setBadges(userBadges.sort((a, b) => b.id.localeCompare(a.id)));
    };

    // ... render logic

    const fetchProfileImage = async () => {
        try {
            const docRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().encryptedPhoto) {
                const decrypted = decryptData(docSnap.data().encryptedPhoto);
                setPhotoPreview(decrypted);
            } else {
                setPhotoPreview(currentUser.photoURL || "");
            }
        } catch (err) {
            console.error("Error fetching image:", err);
        }
    };


    const handleSave = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            // 1. Update Standard Profile (Display Name)
            await updateProfile(currentUser, {
                displayName: displayName
            });

            // 2. Encrypt and Store Photo in Firestore (if changed)
            if (photoPreview && photoPreview.startsWith("data:image")) {
                const encrypted = encryptData(photoPreview);
                // Write to Firestore: users/{uid}
                await setDoc(doc(db, "users", currentUser.uid), {
                    encryptedPhoto: encrypted,
                    updatedAt: new Date().toISOString()
                }, { merge: true });
            }

            setMessage("Profile updated & Image encrypted successfully!");
        } catch (err) {
            console.error(err);
            setError("Failed to update profile: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 lg:p-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

            <div className="bg-white/5 border border-white/5 rounded-2xl p-8">
                <div className="flex flex-col items-center mb-8">
                    <div className="relative group h-32 w-32">
                        {photoPreview ? (
                            <img src={photoPreview} alt="Profile" className="h-full w-full rounded-full object-cover border-4 border-white/10" />
                        ) : (
                            <Avatar user={{ displayName, photoURL: null }} className="h-full w-full text-4xl" />
                        )}
                        {/* Overlay hint */}
                        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <ImageIcon className="text-white" />
                        </div>
                    </div>
                    <p className="mt-4 text-gray-400 text-sm">{currentUser?.email}</p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Display Name</label>
                        <div className="flex items-center gap-3">
                            {isEditingName ? (
                                <div className="relative flex-1">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                                        <User size={18} />
                                    </span>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className="w-full bg-black/20 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="Enter your name"
                                        autoFocus
                                    />
                                </div>
                            ) : (
                                <div className="flex-1 text-xl font-semibold text-white py-2">
                                    {displayName || "User"}
                                </div>
                            )}

                            {/* Toggle Button */}
                            <button
                                type="button"
                                onClick={() => setIsEditingName(!isEditingName)}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                            >
                                {isEditingName ? "Cancel" : <Pencil size={18} />}
                            </button>
                        </div>
                    </div>

                    {error && <div className="p-3 bg-red-500/20 text-red-200 rounded-lg text-sm">{error}</div>}
                    {message && <div className="p-3 bg-green-500/20 text-green-200 rounded-lg text-sm">{message}</div>}

                    {isEditingName && (
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <Save size={18} />
                            {loading ? "Saving..." : "Save Changes"}
                        </button>
                    )}
                </form>

                {/* Logout Button */}
                <div className="mt-8 border-t border-white/10 pt-6">
                    <button
                        onClick={() => logout()}
                        className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 py-3 rounded-lg transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </div>

            {/* Badges Section */}
            <div className="mt-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Award className="text-yellow-500" /> Badges
                </h2>
                {badges.length > 0 ? (
                    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4">
                        {badges.map(badge => (
                            <div key={badge.id} className="group relative aspect-square perspective-1000">
                                {/* Card Container */}
                                <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black border border-yellow-500/20 rounded-xl shadow-lg flex flex-col items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:border-yellow-500/50 group-hover:shadow-yellow-500/20 overflow-hidden">

                                    {/* Subtle Texture - Increased Opacity */}
                                    <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] mix-blend-overlay pointer-events-none"></div>

                                    {/* Inner decorative line */}
                                    <div className="absolute inset-1.5 border border-white/10 rounded-lg pointer-events-none group-hover:border-yellow-500/30 transition-colors"></div>

                                    {/* Icon Top */}
                                    {/* <div className="mb-1 relative z-10">
                                        <Award size={14} className="text-yellow-700 group-hover:text-yellow-400 transition-colors duration-500" />
                                    </div> */}

                                    {/* Month Big */}
                                    <span className="relative z-10 text-xl md:text-2xl font-serif font-black text-transparent bg-clip-text bg-gradient-to-t from-yellow-600 via-yellow-300 to-yellow-100 tracking-wider shadow-sm">
                                        {format(new Date(badge.id + "-02"), "MMM").toUpperCase()}
                                    </span>

                                    {/* Year Small */}
                                    <span className="relative z-10 text-[10px] font-mono text-zinc-600 group-hover:text-yellow-600/80 transition-colors mt-1">
                                        {format(new Date(badge.id + "-02"), "yyyy")}
                                    </span>

                                    {/* Shine effect on hover */}
                                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none transform -skew-x-12 translate-x-full group-hover:translate-x-0"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/5 border border-white/5 rounded-xl p-8 text-center text-gray-500">
                        <Award size={32} className="mx-auto mb-3 opacity-20" />
                        <p>No badges yet.</p>
                        <p className="text-xs mt-1">Complete a perfect month to earn one.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
