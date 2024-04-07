import { useSyncContext } from "@/contexts/SyncContext";
import React, { useEffect, useState } from "react";
import { BadgeArray, getBadgeUnit, updateBadgeProgress } from "../../atoms/badges/BadgesWrapped";
import BadgeCardHomePage, { BadgeCardHomePageSkeleton } from "../../atoms/home/BadgeCardHomePage";
import StatCard from "@/components/atoms/StatCard";
import { sortBasedOnProgress } from "../../atoms/badges/BadgesWrapped";

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

export const ApproachingBadgesSkeleton = () => (
  <StatCard
    name="Almost There"
    description="You're so close to earning these badges!"
    content={
      <>
        <BadgeCardHomePageSkeleton />
        <BadgeCardHomePageSkeleton />
        <BadgeCardHomePageSkeleton />
      </>
    }
  />
);

const ApproachingBadges = () => {
  const { badges, allBadges, stats } = useSyncContext();
  const [approachingBadges, setApproachingBadges] = useState<BadgeArray[]>([]);

  useEffect(() => {
    const badgeIds = badges.map((badge) => badge.badgeId);
    const remaining = allBadges
      .filter((badge) => !badgeIds.includes(badge.id))
      .map((badge) => ({
        ...badge,
        progress: updateBadgeProgress(badge.id, stats),
        achieved: false,
      }));
    setApproachingBadges(sortBasedOnProgress(remaining, stats));
  }, [badges, allBadges, stats]);

  return (
    <StatCard
      name="Almost There"
      description={approachingBadges.length > 0 ? "You're so close to earning these badges!" : ""}
      content={
        approachingBadges.length <= 0
          ? "Found no approaching badges. Keep an eye out for any future badges to achieve!"
          : approachingBadges
              .slice(0, approachingBadges.length <= 3 ? approachingBadges.length : 3)
              .map((badge) => (
                <BadgeCardHomePage
                  key={badge.id}
                  name={badge.name}
                  image={badge.image}
                  description={badge.description}
                  points={badge.points}
                  progress={badge.progress ? badge.progress : 0}
                  threshold={badge.threshold}
                  achieved={false}
                  unit={getBadgeUnit(badge.id)}
                />
              ))
      }
    />
  );
};

export default ApproachingBadges;
