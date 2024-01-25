import React, { createContext, useContext, ReactNode } from 'react';
import { Badge } from '@/utils/types';

interface BadgesContextProps {
  badges: Badge[];
  setBadges: React.Dispatch<React.SetStateAction<Badge[]>>;
}

const BadgesContext = createContext<BadgesContextProps | undefined>(undefined);

export const BadgesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [badges, setBadges] = React.useState<Badge[]>([]);

  return (
    <BadgesContext.Provider value={{ badges, setBadges }}>
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