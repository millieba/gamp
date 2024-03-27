import { useSyncContext } from "@/contexts/SyncContext";
import React, { useEffect, useState } from "react";
import { getBadgeUnit, updateBadgeProgress } from "../../atoms/badges/BadgesWrapped";
import BadgeCardHomePage from "../../atoms/home/BadgeCardHomePage";
import StatCard from "@/components/atoms/StatCard";

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

const ApproachingBadges = () => {
  const { badges, allBadges, stats } = useSyncContext();
  const [approachingBadges, setApproachingBadges] = useState<UnearnedBadges[]>([]);

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
                  progress={badge.progress}
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
