"use client";
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { Badge } from '@/utils/types';
import { useSession } from 'next-auth/react';
import { sync } from '@/components/atoms/ProfilePicture';

interface BadgesContextProps {
  badges: Badge[];
  setBadges: React.Dispatch<React.SetStateAction<Badge[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

const BadgesContext = createContext<BadgesContextProps | undefined>(undefined);

export const BadgesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const currentTime = new Date();
        const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000);

        if (
          session?.user.lastSync === null ||
          (session?.user.lastSync && new Date(session.user.lastSync) < oneHourAgo)
        ) {
          const syncData = await sync(window.location.pathname);
          if (syncData && syncData.badges) {
            setBadges(syncData.badges);
          }
        }
        else {
          setIsLoading(true);
          const res = await fetch('/api/badges'); // Fetch from database if lastSync is within the last hour
          if (res.ok) {
            const badgesData = await res.json();
            setBadges(badgesData.badges);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <BadgesContext.Provider value={{ badges, setBadges, isLoading, setIsLoading }}>
      {children}
    </BadgesContext.Provider>
  );
};

export const useBadgesContext = () => {
  const context = useContext(BadgesContext);
  if (!context) {
    throw new Error('useBadgesContext must be used within a BadgesProvider');
  }
  return context;
};
