import { SessionProvider } from 'next-auth/react';
import { BadgesProvider } from '@/contexts/BadgesContext';
import { StatsProvider } from '@/contexts/StatsContext';

type Props = {
    children: React.ReactNode;
};

export const Providers = ({ children }: Props) => {
    return (
        <SessionProvider>
            <StatsProvider>
                <BadgesProvider>{children}</BadgesProvider>
            </StatsProvider>
        </SessionProvider>
    );
};
