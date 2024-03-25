import { useSyncContext } from "@/contexts/SyncContext";
import React, { useEffect, useState } from "react";
import { getBadgeUnit } from "../../atoms/badges/BadgesWrapped";
import { Badge } from "@/utils/types";
import BadgeCardHomePage from "../../atoms/home/BadgeCardHomePage";
import StatCard from "@/components/atoms/StatCard";

export type FullBadge = Badge & {
  name: string;
  image: string;
  description: string;
  points: number;
  threshold: number;
  type: string;
};

const RecentBadges = () => {
  const { badges, allBadges, stats } = useSyncContext();
  const [recentBadges, setRecentBadges] = useState<FullBadge[]>([]);

  useEffect(() => {
    const sorted = [...badges]
      .map((badge) => {
        const fullBadge = allBadges.find((b) => b.id === badge.badgeId);
        return { ...badge, ...fullBadge } as FullBadge;
      })
      .sort((a, b) => new Date(b.dateEarned).getTime() - new Date(a.dateEarned).getTime());
    setRecentBadges(sorted);
  }, [badges, allBadges, stats]);

  return (
    <StatCard
      name="Recently Earned Badges"
      description={recentBadges.length > 0 ? "Here are the badges you've recently earned. Keep up the good work!" : ""}
      content={
        recentBadges.length <= 0
          ? "Found no recently earned badges. Keep working, and you'll get there!"
          : recentBadges
              .slice(0, recentBadges.length <= 3 ? recentBadges.length : 3)
              .map((badge) => (
                <BadgeCardHomePage
                  key={badge.id}
                  name={badge.name}
                  image={badge.image}
                  description={badge.description}
                  points={badge.points}
                  progress={0}
                  threshold={badge.threshold}
                  achieved={true}
                  date={badge.dateEarned}
                  unit={getBadgeUnit(badge.id)}
                />
              ))
      }
    />
  );
};

export default RecentBadges;
