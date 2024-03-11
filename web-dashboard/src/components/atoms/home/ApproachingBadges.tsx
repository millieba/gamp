import { useSyncContext } from "@/contexts/SyncContext";
import React, { useEffect, useState } from "react";

const ApproachingBadges = () => {
  const { badges, allBadges } = useSyncContext();
  const [unearnedBadges, setUnearnedBadges] = useState<any[]>([]);

  useEffect(() => {
    const badgeIds = badges.map((badge) => badge.badgeId);
    const remaining = allBadges.filter((badge) => !badgeIds.includes(badge.id));
    setUnearnedBadges(remaining);
  }, [badges, allBadges]);

  console.log(unearnedBadges);

  return (
    <div>
      <p>Badges you can still earn!</p>
      {unearnedBadges.map((badge) => (
        <div key={badge.id}>
          <h2>{badge.id}</h2>
        </div>
      ))}
    </div>
  );
};

export default ApproachingBadges;
