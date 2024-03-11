"use client";

import BadgeCard from "@/components/atoms/badges/BadgeCard";
import BadgesWrap from "@/components/atoms/badges/BadgesWrap";
import { useSyncContext } from "@/contexts/SyncContext";
import { tags } from "./BadgesDropDown";
import { useEffect } from "react";
import { Stats } from "@/contexts/SyncContext";

type BadgesWrappedProps = {
  selectedTags: string[];
};

export const updateProgress = (id: string, stats: Stats) => {
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
  return progress;
};

const BadgesWrapped = ({ selectedTags }: BadgesWrappedProps) => {
  const { badges, stats, allBadges } = useSyncContext();
  const earnedBadgeIds = badges?.map((badge) => badge.badgeId);
  let issueRelatedBadges = [];
  let commitsRelatedBadges = [];
  let prRelatedBadges = [];

  useEffect(() => {}, [selectedTags]);

  for (const badge of allBadges) {
    if (badge.id.startsWith("issues-opened-") || badge.id.startsWith("issues-closed-")) {
      const isAchieved = badges.some((earnedBadge) => earnedBadge.badgeId === badge.id);
      let dateAchieved;
      if (isAchieved) {
        dateAchieved = badges.find((earnedBadge) => earnedBadge.badgeId === badge.id)?.dateEarned;
      }
      issueRelatedBadges.push({ ...badge, achieved: isAchieved, dateAchieved: dateAchieved });
    }
    if (badge.id.startsWith("prs-merged-") || badge.id.startsWith("prs-opened-")) {
      const isAchieved = badges.some((earnedBadge) => earnedBadge.badgeId === badge.id);
      let dateAchieved;
      if (isAchieved) {
        dateAchieved = badges.find((earnedBadge) => earnedBadge.badgeId === badge.id)?.dateEarned;
      }
      prRelatedBadges.push({ ...badge, achieved: isAchieved, dateAchieved: dateAchieved });
    }
    if (badge.id.startsWith("cc-")) {
      const isAchieved = badges.some((earnedBadge) => earnedBadge.badgeId === badge.id);
      let dateAchieved;
      if (isAchieved) {
        dateAchieved = badges.find((earnedBadge) => earnedBadge.badgeId === badge.id)?.dateEarned;
      }
      commitsRelatedBadges.push({ ...badge, achieved: isAchieved, dateAchieved: dateAchieved });
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {selectedTags.includes(tags[0]) && (
        <BadgesWrap
          title="Badges you've earned:"
          cards={badges?.map((badge) => (
            <BadgeCard
              key={badge.id}
              name={badge.badgeDefinition.name}
              image={badge.badgeDefinition.image}
              description={badge.badgeDefinition.description}
              points={badge.badgeDefinition.points}
              progress={stats ? updateProgress(badge.badgeId, stats) : 0}
              threshold={badge.badgeDefinition.threshold}
              achieved={true}
              date={badge.dateEarned}
            />
          ))}
        />
      )}
      {selectedTags.includes(tags[1]) && (
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
                progress={stats ? updateProgress(badge.id, stats) : 0}
                threshold={badge.threshold}
                achieved={false}
              />
            ))}
        />
      )}
      {selectedTags.includes(tags[2]) && (
        <BadgesWrap
          title={tags[2] + ":"}
          cards={issueRelatedBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              name={badge.name}
              image={badge.image}
              description={badge.description}
              points={badge.points}
              progress={stats ? updateProgress(badge.id, stats) : 0}
              threshold={badge.threshold}
              achieved={badge.achieved}
              date={badge.achieved ? badge.dateAchieved : undefined}
            />
          ))}
        />
      )}
      {selectedTags.includes(tags[3]) && (
        <BadgesWrap
          title={tags[3] + ":"}
          cards={commitsRelatedBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              name={badge.name}
              image={badge.image}
              description={badge.description}
              points={badge.points}
              progress={stats ? updateProgress(badge.id, stats) : 0}
              threshold={badge.threshold}
              achieved={badge.achieved}
              date={badge.achieved ? badge.dateAchieved : undefined}
            />
          ))}
        />
      )}
      {selectedTags.includes(tags[4]) && (
        <BadgesWrap
          title={tags[4] + ":"}
          cards={prRelatedBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              name={badge.name}
              image={badge.image}
              description={badge.description}
              points={badge.points}
              progress={stats ? updateProgress(badge.id, stats) : 0}
              threshold={badge.threshold}
              achieved={badge.achieved}
              date={badge.achieved ? badge.dateAchieved : undefined}
            />
          ))}
        />
      )}
      {selectedTags.includes(tags[5]) && <p>Currently we don't have badges for miscellaneous</p>}
    </div>
  );
};

export default BadgesWrapped;
