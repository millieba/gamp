'use client';
import { SessionProvider } from 'next-auth/react';
export default SessionProvider;

type Props = {
    children: React.ReactNode,
};

export const Providers = ({ children }: Props) => {
    return <SessionProvider>{children}</SessionProvider>
}