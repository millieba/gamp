import { useSyncContext } from "@/contexts/SyncContext";
import React, { useEffect, useState } from "react";
import { Badge } from "@/utils/types";

const RecentBadges = () => {
  const { badges } = useSyncContext();
  const [sortedBadges, setSortedBadges] = useState<Badge[]>([]);

  useEffect(() => {
    const sorted = [...badges].sort((a, b) => new Date(b.dateEarned).getTime() - new Date(a.dateEarned).getTime());
    setSortedBadges(sorted);
  }, [badges]);

  return (
    <div>
      {sortedBadges.map((badge) => (
        <div key={badge.id}>
          <h2>{badge.badgeId}</h2>
          <p>Date Earned: {new Date(badge.dateEarned).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
};

export default RecentBadges;
