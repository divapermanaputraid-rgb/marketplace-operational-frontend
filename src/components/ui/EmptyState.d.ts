import type { ReactNode } from 'react';
interface EmptyStateProps {
    icon: ReactNode;
    title: string;
    description: string;
    action?: ReactNode;
    className?: string;
}
export declare function EmptyState({ icon, title, description, action, className }: EmptyStateProps): import("react/jsx-runtime").JSX.Element;
export {};
