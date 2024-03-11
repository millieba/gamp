import { useSyncContext } from "@/contexts/SyncContext";
import React, { useEffect, useState } from "react";
import BadgeCard from "../badges/BadgeCard";
import { updateProgress } from "../badges/BadgesWrapped";
import BadgesHomePageWrap from "./BadgesHomePageWrap";
import { Badge } from "@/utils/types";

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
  const [unearnedBadges, setUnearnedBadges] = useState<UnearnedBadges[]>([]);
  const [sortedBadges, setSortedBadges] = useState<FullBadge[]>([]);

  useEffect(() => {
    const badgeIds = badges.map((badge) => badge.badgeId);
    const remaining = allBadges
      .filter((badge) => !badgeIds.includes(badge.id))
      .map((badge) => ({
        ...badge,
        progress: stats ? updateProgress(badge.id, stats) : 0,
      }))
      .sort((a, b) => a.threshold - a.progress - (b.threshold - b.progress));
    setUnearnedBadges(remaining);

    const sorted = [...badges]
      .map((badge) => {
        const fullBadge = allBadges.find((b) => b.id === badge.badgeId);
        return { ...badge, ...fullBadge } as FullBadge;
      })
      .sort((a, b) => new Date(b.dateEarned).getTime() - new Date(a.dateEarned).getTime());
    setSortedBadges(sorted);
  }, [badges, allBadges, stats]);

  console.log(unearnedBadges);

  return (
    <>
      <BadgesHomePageWrap
        recentBadgesCards={unearnedBadges.slice(0, 3).map((badge) => (
          <BadgeCard
            key={badge.id}
            name={badge.name}
            image={badge.image}
            description={badge.description}
            points={badge.points}
            progress={badge.progress}
            threshold={badge.threshold}
            achieved={false}
          />
        ))}
        approachingBadgesCards={sortedBadges.slice(0, 3).map((badge) => (
          <BadgeCard
            key={badge.id}
            name={badge.name}
            image={badge.image}
            description={badge.description}
            points={badge.points}
            progress={0}
            threshold={badge.threshold}
            achieved={true}
            date={badge.dateEarned}
          />
        ))}
      />
    </>
  );
};

export default RecentAndApproachingBadges;
