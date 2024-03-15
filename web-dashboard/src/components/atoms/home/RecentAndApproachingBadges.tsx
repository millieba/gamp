import { useSyncContext } from "@/contexts/SyncContext";
import React, { useEffect, useState } from "react";
import { getBadgeUnit, updateBadgeProgress } from "../badges/BadgesWrapped";
import BadgesHomePageWrap from "./BadgesHomePageWrap";
import { Badge } from "@/utils/types";
import BadgeCardHomePage from "./BadgeCardHomePage";

interface UnearnedBadges {
  description: string;
  id: string;
  image: string;
  name: string;
  points: number;
  progress: number;
  threshold: number;
  type: string;
}

type FullBadge = Badge & {
  name: string;
  image: string;
  description: string;
  points: number;
  threshold: number;
  type: string;
};

const RecentAndApproachingBadges = () => {
  const { badges, allBadges, stats } = useSyncContext();
  const [approachingBadges, setApproachingBadges] = useState<UnearnedBadges[]>([]);
  const [recentBadges, setRecentBadges] = useState<FullBadge[]>([]);

  useEffect(() => {
    const badgeIds = badges.map((badge) => badge.badgeId);
    const remaining = allBadges
      .filter((badge) => !badgeIds.includes(badge.id))
      .map((badge) => ({
        ...badge,
        progress: updateBadgeProgress(badge.id, stats),
      }))
      .sort((a, b) => a.threshold - a.progress - (b.threshold - b.progress));
    setApproachingBadges(remaining);

    const sorted = [...badges]
      .map((badge) => {
        const fullBadge = allBadges.find((b) => b.id === badge.badgeId);
        return { ...badge, ...fullBadge } as FullBadge;
      })
      .sort((a, b) => new Date(b.dateEarned).getTime() - new Date(a.dateEarned).getTime());
    setRecentBadges(sorted);
  }, [badges, allBadges, stats]);

  return (
    <>
      <BadgesHomePageWrap
        approachingBadgesCards={
          approachingBadges.length <= 0
            ? []
            : approachingBadges
                .slice(0, approachingBadges.length <= 3 ? approachingBadges.length : 3)
                .map((badge) => (
                  <BadgeCardHomePage
                    key={badge.id}
                    name={badge.name}
                    image={badge.image}
                    description={badge.description}
                    points={badge.points}
                    progress={badge.progress}
                    threshold={badge.threshold}
                    achieved={false}
                    unit={getBadgeUnit(badge.id)}
                  />
                ))
        }
        recentBadgesCards={
          recentBadges.length <= 0
            ? []
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
    </>
  );
};

export default RecentAndApproachingBadges;
