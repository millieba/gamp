"use client";

import BadgeCard from "@/components/atoms/BadgeCard";
import { useSyncContext } from "@/contexts/SyncContext";

const BadgesPage = () => {
  const { badges, isLoading, stats, allBadges } = useSyncContext();
  const earnedBadgeIds = badges?.map((badge) => badge.id);

  return (
    <div>
      <h1 className="text-2xl">Badges</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          <p>Badges you've earned: </p>
          {badges?.map((badge) => (
            <BadgeCard
              key={badge.id}
              name={badge.name}
              image={badge.image}
              description={badge.description}
              points={badge.points}
              progress={stats?.commitCount || 0}
              threshold={badge.threshold}
              achieved={true}
            />
          ))}
          <p>Badges yet to achieve: </p>
          {allBadges
            ?.filter((badge) => !earnedBadgeIds.includes(badge.id))
            .map((badge) => (
              <BadgeCard
                key={badge.id}
                name={badge.name}
                image={badge.image}
                description={badge.description}
                points={badge.points}
                progress={stats?.commitCount || 0}
                threshold={badge.threshold}
                achieved={false}
              />
            ))}
        </>
      )}
    </div>
  );
};

export default BadgesPage;
