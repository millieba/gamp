import { useSyncContext } from "@/contexts/SyncContext";
import React, { useEffect, useState } from "react";
import BadgeCard from "../badges/BadgeCard";
import { updateProgress } from "../badges/BadgesWrapped";
import BadgesWrap from "../badges/BadgesWrap";

const ApproachingBadges = () => {
  const { badges, allBadges, stats } = useSyncContext();
  const [unearnedBadges, setUnearnedBadges] = useState<any[]>([]);

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
  }, [badges, allBadges, stats]);

  console.log(unearnedBadges);

  return (
    <BadgesWrap
      title="Badges you can still earn!"
      cards={unearnedBadges.slice(0, 3).map((badge) => (
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
    />
  );
};

export default ApproachingBadges;
