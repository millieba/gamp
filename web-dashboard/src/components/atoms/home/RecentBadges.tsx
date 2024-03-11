import { useSyncContext } from "@/contexts/SyncContext";
import React, { useEffect, useState } from "react";
import { Badge } from "@/utils/types";
import BadgeCard from "../badges/BadgeCard";
import { updateProgress } from "../badges/BadgesWrapped";

type FullBadge = Badge & {
  name: string;
  image: string;
  description: string;
  points: number;
  threshold: number;
  type: string;
};

const RecentBadges = () => {
  const { badges, allBadges, stats } = useSyncContext();
  const [sortedBadges, setSortedBadges] = useState<FullBadge[]>([]);

  useEffect(() => {
    const sorted = [...badges]
      .map((badge) => {
        const fullBadge = allBadges.find((b) => b.id === badge.badgeId);
        return { ...badge, ...fullBadge } as FullBadge;
      })
      .sort((a, b) => new Date(b.dateEarned).getTime() - new Date(a.dateEarned).getTime());
    setSortedBadges(sorted);
  }, [badges, allBadges]);

  return (
    <div>
      {/* Slicing to only show the three recent badges earned. */}
      {sortedBadges.slice(0, 3).map((badge) => (
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
    </div>
  );
};

export default RecentBadges;
