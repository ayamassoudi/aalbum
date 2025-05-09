import { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ForgotPasswordPage } from "../auth/pages/ForgotPasswordPage";
import { LoginPage } from "../auth/pages/LoginPage";
import { SignUpPage } from "../auth/pages/SignUpPage";
import { useAuthStore } from "../hooks/useAuthStore";
import { CheckingAuth } from "../ui/components/CheckingAuth";
import { OtherRoutes } from "./OtherRoutes";
import AdminDashboard from "../app/components/AdminDashboard";

export const AppRouter = () => {
    const {status, checkAuthToken, user} = useAuthStore();
    
    useEffect(() => {
      checkAuthToken();
    }, []);

    if (status === 'checking') {
      return <CheckingAuth />
    }

    return (
        <Routes>
            {
                (status === 'not-authenticated')
                ? (
                  <>
                    <Route path="/auth/login" element={<LoginPage />} />
                    <Route path="/auth/signup" element={<SignUpPage />} />
                    <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                    <Route path="/*" element={<Navigate to='/auth/login' />} />
                  </>
                ) : (
                  <>
                    {user.isAdmin && (
                      <Route path="/admin" element={<AdminDashboard />} />
                    )}
                    <Route path="/*" element={<OtherRoutes />} />
                  </>
                )
            }
        </Routes>
    );
}
