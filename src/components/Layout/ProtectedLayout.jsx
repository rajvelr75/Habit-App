import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { AppLayout } from "./AppLayout";

export default function ProtectedLayout() {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    return (
        <AppLayout>
            <Outlet />
        </AppLayout>
    );
}
