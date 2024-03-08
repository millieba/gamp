"use client";

import BadgeCard from "@/components/atoms/badges/BadgeCard";
import BadgesWrap from "@/components/atoms/badges/BadgesWrap";
import { useSyncContext } from "@/contexts/SyncContext";
import { tags } from "./BadgesDropDown";
import { useEffect } from "react";

type BadgesWrappedProps = {
  selectedTags: string[];
};

const BadgesWrapped = ({ selectedTags }: BadgesWrappedProps) => {
  const { badges, stats, allBadges } = useSyncContext();
  const earnedBadgeIds = badges?.map((badge) => badge.badgeId);
  useEffect(() => {}, [selectedTags]);

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
    return progress;
  };

  return (
    <>
      {selectedTags?.length === 0 && <p>No badges chosen! Pick from the list above.</p>}
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
              progress={updateProgress(badge.badgeId)}
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
                progress={updateProgress(badge.id)}
                threshold={badge.threshold}
                achieved={false}
              />
            ))}
        />
      )}
    </>
  );
};

export default BadgesWrapped;
