import clsx from 'clsx';

export function Avatar({ user, className }) {
    if (!user) return null;

    if (user.photoURL) {
        return (
            <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className={clsx("rounded-full object-cover", className)}
            />
        );
    }

    // Fallback: First letter of name or email
    const letter = (user.displayName?.[0] || user.email?.[0] || "?").toUpperCase();

    return (
        <div className={clsx("rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-medium", className)}>
            {letter}
        </div>
    );
}
