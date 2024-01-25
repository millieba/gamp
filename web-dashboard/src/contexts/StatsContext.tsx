import React, { createContext, useContext, ReactNode } from 'react';

interface StatsContextProps {
    statsData: any; // Replace 'any' with the actual type of your stats data
    setStatsData: React.Dispatch<React.SetStateAction<any>>;
}

const StatsContext = createContext<StatsContextProps | undefined>(undefined);

export const StatsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [statsData, setStatsData] = React.useState<any>(null); // Replace 'any' with the actual initial state type

    return (
        <StatsContext.Provider value={{ statsData, setStatsData }}>
            {children}
        </StatsContext.Provider>
    );
};

export const useStatsContext = () => {
    const context = useContext(StatsContext);
    if (!context) {
        throw new Error('useStatsContext must be used within a StatsProvider');
    }
    return context;
};
