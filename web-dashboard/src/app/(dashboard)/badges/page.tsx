"use client";

import BadgeCard from "@/components/atoms/BadgeCard";
import BadgesWrap from "@/components/atoms/BadgesWrap";
import { useSyncContext } from "@/contexts/SyncContext";

const BadgesPage = () => {
  const { badges, isLoading, stats, allBadges } = useSyncContext();
  const earnedBadgeIds = badges?.map((badge) => badge.badgeId);
  console.log(earnedBadgeIds);

  const updateProgress = (id: string) => {
    let progress = 0;

    if (id.startsWith("prs-opened-")) {
      progress = stats?.createdPrs || 0;
    } else if (id.startsWith("prs-merged-")) {
      progress = stats?.createdAndMergedPrs || 0;
    } else if (id.startsWith("cc-")) {
      progress = stats?.commitCount || 0;
    } else if (id.startsWith("issues-opened-")) {
      progress = stats?.issueCount || 0;
    } else if (id.startsWith("issues-closed-")) {
      progress = stats?.closedIssueCount || 0;
    }

    console.log(progress);

    return progress;
  };

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
                progress={updateProgress(badge.badgeId)}
                threshold={badge.badgeDefinition.threshold}
                achieved={true}
                date={badge.dateEarned}
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
                  progress={updateProgress(badge.id)}
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
