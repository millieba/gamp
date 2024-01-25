"use client";
import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { Badge } from '@/utils/types';

interface BadgesContextProps {
  badges: Badge[];
  setBadges: React.Dispatch<React.SetStateAction<Badge[]>>;
  isLoading: boolean;
}

const BadgesContext = createContext<BadgesContextProps | undefined>(undefined);

export const BadgesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [badges, setBadges] = React.useState<Badge[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/badges');
        if (res.ok) {
          const badgesData = await res.json();
          setBadges(badgesData.badges);
        } else {
          throw new Error('Failed to fetch badges');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Fetch data only on component mount

  return (
    <BadgesContext.Provider value={{ badges, setBadges, isLoading }}>
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
