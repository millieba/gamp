import { SessionProvider } from 'next-auth/react';
import { SyncProvider } from '@/contexts/SyncContext';

type Props = {
    children: React.ReactNode;
};

export const Providers = ({ children }: Props) => {
    return (
        <SessionProvider>
            <SyncProvider>{children}</SyncProvider>
        </SessionProvider>
    );
};
