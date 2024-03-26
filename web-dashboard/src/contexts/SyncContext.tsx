"use client";
import { createContext, useContext, ReactNode, useEffect, useState, Dispatch, SetStateAction } from "react";
import { Badge } from "@/utils/types";
import { useSession } from "next-auth/react";
import { BadgeDefinition, Level } from "@prisma/client";
import { Modification } from "@/app/api/commits/commitsService";
import { AssignedIssueInterface } from "@/app/api/issues/issuesUtils";
import { Preferences } from "@/app/api/preferences/preferenceService";

export interface Stats {
  commitCount: number;
  issueCount: number;
  avgTimeToCloseIssues: number;
  closedIssueCount: number;
  createdPrs: number;
  createdAndMergedPrs: number;
  programmingLanguages: ProgrammingLanguage[];
  assignedIssues: AssignedIssueInterface[];
  dailyModifications: Modification[];
  nightCommitCount: number;
  morningCommitCount: number;
  strictStreak: number | null;
  strictStreakToContinue: number | null;
  workdayStreak: number | null;
  workdayStreakToContinue: number | null;
}

export interface ProgrammingLanguage {
  name: string;
  bytesWritten: number;
  firstUsedAt: Date | string;
}

export interface LevelData {
  currentLevel: Level;
  nextLevel: Level | null;
  totalPoints: number;
}

export async function sync(
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  setBadges: Dispatch<SetStateAction<Badge[]>>,
  setAllBadges: Dispatch<SetStateAction<BadgeDefinition[]>>,
  setStats: Dispatch<SetStateAction<Stats | undefined>>,
  setLevel: Dispatch<SetStateAction<LevelData | undefined>>
) {
  try {
    setIsLoading(true);
    const syncResponse = await fetch("/api/sync");
    if (syncResponse.ok) {
      await fetchFromDB(setIsLoading, setBadges, setAllBadges, setStats, setLevel);
    }
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }
}

export async function fetchFromDB(
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  setBadges: Dispatch<SetStateAction<Badge[]>>,
  setAllBadges: Dispatch<SetStateAction<BadgeDefinition[]>>,
  setStats: Dispatch<SetStateAction<Stats | undefined>>,
  setLevel: Dispatch<SetStateAction<LevelData | undefined>>
) {
  setIsLoading(true);
  try {
    const [badgesData, allBadgesData, statsData, levelData] = await Promise.all([
      fetch("api/badges").then((res) => res.json()),
      fetch("api/badges/all").then((res) => res.json()),
      fetch("api/stats").then((res) => res.json()),
      fetch("api/level").then((res) => res.json()),
    ]);

    setBadges(badgesData.badges);
    setAllBadges(allBadgesData);
    setStats(statsData.githubStats);
    setLevel(levelData);
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false);
  }
}

interface SyncContextProps {
  badges: Badge[];
  setBadges: Dispatch<SetStateAction<Badge[]>>;
  allBadges: BadgeDefinition[];
  setAllBadges: Dispatch<SetStateAction<BadgeDefinition[]>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  stats: Stats | undefined;
  setStats: Dispatch<SetStateAction<Stats | undefined>>;
  level: LevelData | undefined;
  setLevel: Dispatch<SetStateAction<LevelData | undefined>>;
  preferences: Preferences | undefined;
  setPreferences: Dispatch<SetStateAction<Preferences | undefined>>;
}

const SyncContext = createContext<SyncContextProps | undefined>(undefined);

export const SyncProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [allBadges, setAllBadges] = useState<BadgeDefinition[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<Stats | undefined>();
  const [level, setLevel] = useState<LevelData | undefined>();
  const [preferences, setPreferences] = useState<Preferences | undefined>();
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (status === "authenticated" && session?.user) {
          const preferencesFromDB = await fetch("/api/preferences");
          if (preferencesFromDB.ok) {
            const preferencesData = await preferencesFromDB.json();
            setPreferences(preferencesData.preferences);
          }
          const currentTime = new Date();
          const oneHourAgo = new Date(currentTime.getTime() - 60 * 60 * 1000);
          if (
            session.user.lastSync === null || // Do full sync with GitHub if lastSync is null or more than an hour ago
            (session.user.lastSync && new Date(session.user.lastSync) < oneHourAgo)
          ) {
            await sync(setIsLoading, setBadges, setAllBadges, setStats, setLevel);
          } else {
            // Fetch from database if lastSync is within the last hour
            await fetchFromDB(setIsLoading, setBadges, setAllBadges, setStats, setLevel);
          }
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [status]);

  return (
    <SyncContext.Provider
      value={{
        badges,
        setBadges,
        allBadges,
        setAllBadges,
        isLoading,
        setIsLoading,
        stats,
        setStats,
        level,
        setLevel,
        preferences,
        setPreferences,
      }}
    >
      {children}
    </SyncContext.Provider>
  );
};

export const useSyncContext = () => {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error("useSyncContext must be used within a SyncProvider");
  }
  return context;
};
