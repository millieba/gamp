import React, { createContext, useContext, ReactNode } from 'react';

interface StatsContextProps {
    statsData: any; // TODO: type stats data when endpoints and database are set up
    setStatsData: React.Dispatch<React.SetStateAction<any>>;
}

const StatsContext = createContext<StatsContextProps | undefined>(undefined);

export const StatsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [statsData, setStatsData] = React.useState<any>(null); // TODO: type this

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
