"use client";
import { createContext, useContext, ReactNode, useEffect, useState, Dispatch, SetStateAction } from 'react';
import { Badge } from '@/utils/types';
import { useSession } from 'next-auth/react';
import { Stats, useStatsContext } from './StatsContext';

interface BadgesContextProps {
  badges: Badge[];
  setBadges: Dispatch<SetStateAction<Badge[]>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export async function sync(setIsLoading: Dispatch<SetStateAction<boolean>>, setBadges: Dispatch<SetStateAction<Badge[]>>, setStats: Dispatch<SetStateAction<Stats | undefined>>) {
  try {
    setIsLoading(true);
    const syncResponse = await fetch('/api/sync'); // This endpoint updates the database with the latest data from GitHub
    if (syncResponse.ok) {
      await fetchFromDB(setIsLoading, setBadges, setStats); // Fetch the updated data from the database, and update the context
    }
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }
}

export async function fetchFromDB(setIsLoading: Dispatch<SetStateAction<boolean>>, setBadges: Dispatch<SetStateAction<Badge[]>>, setStats: Dispatch<SetStateAction<Stats | undefined>>) {
  try {
    setIsLoading(true);
    const badgesData = await fetch(`api/badges`).then((res) => res.json());
    setBadges(badgesData.badges);
    const statsData = await fetch(`api/stats`).then((res) => res.json()); // TODO: Uncomment when stats endpoint is implemented
    setStats(statsData.stats);
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }
}

const BadgesContext = createContext<BadgesContextProps | undefined>(undefined);

export const BadgesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { stats, setStats } = useStatsContext();
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
            await sync(setIsLoading, setBadges, setStats);
          } else { // Fetch from database if lastSync is within the last hour
            await fetchFromDB(setIsLoading, setBadges, setStats);
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
