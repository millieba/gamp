"use client";
import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { Badge } from '@/utils/types';
import { useSession } from 'next-auth/react';

interface BadgesContextProps {
  badges: Badge[];
  setBadges: React.Dispatch<React.SetStateAction<Badge[]>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
}

export async function sync(currentPage: string, setIsLoading: React.Dispatch<React.SetStateAction<boolean>>) {
  try {
    setIsLoading(true);
    const syncResponse = await fetch('/api/sync');
    if (syncResponse.ok && (currentPage === '/badges' || currentPage === '/stats')) {
      const data = await fetch(`api${currentPage}`).then((res) => res.json());
      return data;
    }
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }
}

const BadgesContext = createContext<BadgesContextProps | undefined>(undefined);

export const BadgesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (status === 'authenticated' && session?.user) { // Ensure that session data is available
          const currentTime = new Date();
          const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000);
          if (session.user.lastSync === null || // Do full sync with GitHub if lastSync is null or more than an hour ago
            (session.user.lastSync && new Date(session.user.lastSync) < oneHourAgo)) {
            const syncData = await sync(window.location.pathname, setIsLoading);
            if (syncData && syncData.badges) {
              setBadges(syncData.badges);
            }
          } else { // Fetch from database if lastSync is within the last hour
            setIsLoading(true);
            const res = await fetch('/api/badges'); 
            if (res.ok) {
              const badgesData = await res.json();
              setBadges(badgesData.badges);
            }
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [status]);

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
