import { createContext, useContext, ReactNode, Dispatch, SetStateAction, useState } from 'react';

export interface Stats {
    commitCount: number;
    programmingLanguages: ProgrammingLanguage[];
}

export interface ProgrammingLanguage {
    name: string;
    codeBytes: number;
}

interface StatsContextProps {
    stats: Stats | undefined;
    setStats: Dispatch<SetStateAction<Stats | undefined>>;
}

const StatsContext = createContext<StatsContextProps | undefined>(undefined);

export const StatsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [stats, setStats] = useState<Stats | undefined>();

    return (
        <StatsContext.Provider value={{ stats, setStats }}>
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
