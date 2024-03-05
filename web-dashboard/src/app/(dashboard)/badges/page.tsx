"use client";

import BadgeCard from "@/components/atoms/BadgeCard";
import BadgesWrap from "@/components/atoms/BadgesWrap";
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
          <BadgesWrap
            title="Badges you've earned:"
            cards={badges?.map((badge) => (
              <BadgeCard
                key={badge.id}
                name={badge.badgeDefinition.name}
                image={badge.badgeDefinition.image}
                description={badge.badgeDefinition.description}
                points={badge.badgeDefinition.points}
                progress={stats?.commitCount || 0}
                threshold={badge.badgeDefinition.threshold}
                achieved={true}
              />
            ))}
          />
          <BadgesWrap
            title="Badges yet to achieve:"
            cards={allBadges
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
          />
        </>
        // <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:px-4 m-4">
        //   {badges?.map((badge) => (
        //     <div key={badge.id} className="p-4 rounded-md shadow-md">
        //       <p className="text-lg font-semibold mb-2">{badge.badgeDefinition.name}</p>
        //       <img src={badge.badgeDefinition.image} alt="Badge" width={150} />
        //       <p className="text-sm mt-6">{badge.badgeDefinition.description}</p>
        //     </div>
        //   ))}
        // </div>
      )}
    </div>
  );
};

export default BadgesPage;
