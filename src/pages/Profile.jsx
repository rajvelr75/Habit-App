import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { updateProfile } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore"; // Import Firestore methods
import { db } from "../firebase";
import { encryptData, decryptData } from "../utils/crypto";
import { format } from "date-fns";
import { Avatar } from "../components/ui/Avatar";
import { Save, User, Upload, Image as ImageIcon, Pencil, LogOut, Shield, Star, Hexagon } from "lucide-react";

import { checkAndGrantMonthlyBadge, getUserBadges } from "../services/db";
import { Award } from "lucide-react";

const getBadgeTheme = (dateId) => {
    // dateId format: "YYYY-MM"
    const month = parseInt(dateId.split('-')[1]);

    // Minimalist Token Theme (Matte Black + Neon Border)
    const base = {
        bg: "bg-zinc-900",
        text: "text-zinc-100",
        subtext: "text-zinc-500"
    };

    switch (month) {
        case 1: // Jan - Red
            return { ...base, border: "border-red-500", color: "text-red-500" };
        case 2: // Feb - Purple
            return { ...base, border: "border-purple-500", color: "text-purple-500" };
        case 3: // Mar - Cyan
            return { ...base, border: "border-cyan-500", color: "text-cyan-500" };
        case 4: // Apr - White
            return { ...base, border: "border-zinc-200", color: "text-zinc-200" };
        case 5: // May - Emerald
            return { ...base, border: "border-emerald-500", color: "text-emerald-500" };
        case 6: // Jun - Orange
            return { ...base, border: "border-orange-400", color: "text-orange-400" };
        case 7: // Jul - Rose
            return { ...base, border: "border-rose-500", color: "text-rose-500" };
        case 8: // Aug - Lime
            return { ...base, border: "border-lime-500", color: "text-lime-500" };
        case 9: // Sep - Blue
            return { ...base, border: "border-blue-500", color: "text-blue-500" };
        case 10: // Oct - Pink
            return { ...base, border: "border-pink-500", color: "text-pink-500" };
        case 11: // Nov - Yellow
            return { ...base, border: "border-yellow-500", color: "text-yellow-500" };
        case 12: // Dec - Indigo
            return { ...base, border: "border-indigo-500", color: "text-indigo-500" };
        default:
            return { ...base, border: "border-zinc-600", color: "text-zinc-400" };
    }
};

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
            fetchProfileImage();
            checkAndGrantMonthlyBadge(currentUser.uid).then(() => {
                loadBadges();
            });
        }
    }, [currentUser]);

    const loadBadges = async () => {
        const userBadges = await getUserBadges(currentUser.uid);
        setBadges(userBadges.sort((a, b) => b.id.localeCompare(a.id)));
    };

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
            await updateProfile(currentUser, { displayName: displayName });
            if (photoPreview && photoPreview.startsWith("data:image")) {
                const encrypted = encryptData(photoPreview);
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
                        <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <ImageIcon className="text-white" />
                        </div>
                    </div>
                    <p className="mt-4 text-gray-400 text-sm">{currentUser?.email}</p>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
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

            <div className="mt-8">
                <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Shield className="text-zinc-500" /> Medals
                </h2>
                {badges.length > 0 ? (
                    <div className="grid grid-cols-3 xs:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6">
                        {badges.map(badge => (
                            <div key={badge.id} className="group relative w-full aspect-square">
                                {(() => {
                                    const theme = getBadgeTheme(badge.id);
                                    return (
                                        <div className={`
                                            relative h-full w-full rounded-2xl
                                            ${theme.bg} border-2 ${theme.border}
                                            flex flex-col items-center justify-center
                                            transition-all duration-300
                                            group-hover:scale-105 group-hover:shadow-lg
                                            cursor-default
                                        `}>

                                            {/* Minimalist Icon */}
                                            <div className={`mb-2 ${theme.color}`}>
                                                <Hexagon size={24} strokeWidth={2} className="fill-current bg-opacity-20" />
                                            </div>

                                            {/* Month Name */}
                                            <div className={`text-xs font-bold tracking-widest uppercase ${theme.text}`}>
                                                {format(new Date(badge.id + "-02"), "MMM")}
                                            </div>

                                            {/* Year */}
                                            <div className={`text-[10px] mt-1 ${theme.subtext}`}>
                                                {format(new Date(badge.id + "-02"), "yyyy")}
                                            </div>

                                        </div>
                                    );
                                })()}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white/5 border border-white/5 rounded-xl p-8 text-center text-gray-500">
                        <Award size={32} className="mx-auto mb-3 opacity-20" />
                        <p>No medals yet.</p>
                        <p className="text-xs mt-1">Keep your streak alive.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
