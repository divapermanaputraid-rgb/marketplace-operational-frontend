import type { ReactNode } from 'react';
export interface Admin {
    id: string;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    last_login_at?: string;
    created_at: string;
}
interface AuthContextType {
    admin: Admin | null;
    token: string | null;
    isLoading: boolean;
    login: (token: string, adminData: Admin) => void;
    logout: () => void;
    refreshMe: () => Promise<void>;
}
export declare function AuthProvider({ children }: {
    children: ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useAuth(): AuthContextType;
export {};
