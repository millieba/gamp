"use client";

import BadgeCard from "@/components/atoms/badges/BadgeCard";
import BadgesWrap from "@/components/atoms/badges/BadgesWrap";
import { useSyncContext } from "@/contexts/SyncContext";
import { tags } from "./BadgesDropDown";
import { useEffect } from "react";
import { Stats } from "@/contexts/SyncContext";
import { BadgeDefinition } from "@prisma/client";

type BadgesWrappedProps = {
  selectedTags: string[];
};

const badgeUnitMapping: { [key: string]: string } = {
  "prs-opened-": "pull requests",
  "prs-merged-": "pull requests",
  "cc-": "commits",
  "issues-opened-": "issues",
  "issues-closed-": "issues",
  "workday-streak-": "days",
  "strict-streak-": "days",
};

const badgeProgressMapping = (stats: Stats) => ({
  "prs-opened-": () => stats?.createdPrs || 0,
  "prs-merged-": () => stats?.createdAndMergedPrs || 0,
  "cc-": () => stats?.commitCount || 0,
  "issues-opened-": () => stats?.issueCount || 0,
  "issues-closed-": () => stats?.closedIssueCount || 0,
  "workday-streak-": () => stats?.workdayStreak || 0,
  "strict-streak-": () => stats?.strictStreak || 0,
});

export const getBadgeUnit = (id: string) => {
  for (const prefix in badgeUnitMapping) {
    if (id.startsWith(prefix)) {
      return badgeUnitMapping[prefix];
    }
  }
  return "";
};

export const updateBadgeProgress = (id: string, stats: Stats | undefined) => {
  if (stats) {
    const progressMapping: { [key: string]: () => number } = badgeProgressMapping(stats);
    for (const prefix in progressMapping) {
      if (id.startsWith(prefix)) {
        return progressMapping[prefix]();
      }
    }
  }
  return 0;
};

type BadgeArray = BadgeDefinition & {
  achieved: boolean;
  dateAchieved?: Date | undefined;
};

const BadgesWrapped = ({ selectedTags }: BadgesWrappedProps) => {
  const { badges, stats, allBadges } = useSyncContext();
  const earnedBadgeIds = badges?.map((badge) => badge.badgeId);
  let issueRelatedBadges: BadgeArray[] = [];
  let commitsRelatedBadges: BadgeArray[] = [];
  let prRelatedBadges: BadgeArray[] = [];
  let workdayStreakBadges: BadgeArray[] = [];
  let strictStreakBadges: BadgeArray[] = [];
  let organizedAllBadges: BadgeArray[] = [];

  useEffect(() => {}, [selectedTags]);

  function processBadge(array: BadgeArray[], types: string[]) {
    let typeArrays: BadgeArray[][] = types.map(() => []);

    for (const badge of allBadges) {
      const typeIndex = types.findIndex((type) => badge.id.startsWith(type));
      if (typeIndex !== -1) {
        const isAchieved = earnedBadgeIds.includes(badge.id);
        let dateAchieved;
        if (isAchieved) {
          dateAchieved = badges.find((earnedBadge) => earnedBadge.badgeId === badge.id)?.dateEarned;
        }
        typeArrays[typeIndex].push({ ...badge, achieved: isAchieved, dateAchieved: dateAchieved });
      }
    }

    typeArrays.forEach((typeArray) => typeArray.sort((a, b) => a.threshold - b.threshold));
    return array.concat(...typeArrays);
  }

  // Running the function on each "subcategory of badges"
  issueRelatedBadges = processBadge(issueRelatedBadges, ["issues-opened-", "issues-closed-"]);
  prRelatedBadges = processBadge(prRelatedBadges, ["prs-opened-", "prs-merged-"]);
  commitsRelatedBadges = processBadge(commitsRelatedBadges, ["cc-"]);
  workdayStreakBadges = processBadge(workdayStreakBadges, ["workday-streak-"]);
  strictStreakBadges = processBadge(strictStreakBadges, ["strict-streak-"]);

  // Combining all the badges into one array, which is sorted as desired
  organizedAllBadges = issueRelatedBadges
    .concat(prRelatedBadges)
    .concat(commitsRelatedBadges)
    .concat(workdayStreakBadges)
    .concat(strictStreakBadges);

  return (
    <div className="flex flex-col gap-5">
      {selectedTags.includes(tags[0]) && badges.length > 0 && (
        <BadgesWrap
          title="Badges you've earned:"
          cards={badges
            ?.sort((a, b) => new Date(b.dateEarned).getTime() - new Date(a.dateEarned).getTime())
            .map((badge) => (
              <BadgeCard
                key={badge.id}
                name={badge.badgeDefinition.name}
                image={badge.badgeDefinition.image}
                description={badge.badgeDefinition.description}
                points={badge.badgeDefinition.points}
                progress={updateBadgeProgress(badge.badgeId, stats)}
                threshold={badge.badgeDefinition.threshold}
                achieved={true}
                date={badge.dateEarned}
                unit={getBadgeUnit(badge.badgeId)}
              />
            ))}
        />
      )}
      {selectedTags.includes(tags[1]) && (
        <BadgesWrap
          title="Badges yet to achieve:"
          cards={organizedAllBadges
            ?.filter((badge) => !earnedBadgeIds.includes(badge.id))
            .map((badge) => (
              <BadgeCard
                key={badge.id}
                name={badge.name}
                image={badge.image}
                description={badge.description}
                points={badge.points}
                progress={updateBadgeProgress(badge.id, stats)}
                threshold={badge.threshold}
                achieved={false}
                unit={getBadgeUnit(badge.id)}
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
              progress={updateBadgeProgress(badge.id, stats)}
              threshold={badge.threshold}
              achieved={badge.achieved}
              date={badge.achieved ? badge.dateAchieved : undefined}
              unit={getBadgeUnit(badge.id)}
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
              progress={updateBadgeProgress(badge.id, stats)}
              threshold={badge.threshold}
              achieved={badge.achieved}
              date={badge.achieved ? badge.dateAchieved : undefined}
              unit={getBadgeUnit(badge.id)}
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
              progress={updateBadgeProgress(badge.id, stats)}
              threshold={badge.threshold}
              achieved={badge.achieved}
              date={badge.achieved ? badge.dateAchieved : undefined}
              unit={getBadgeUnit(badge.id)}
            />
          ))}
        />
      )}
      {selectedTags.includes(tags[5]) && (
        <BadgesWrap
          title={tags[5] + ":"}
          cards={workdayStreakBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              name={badge.name}
              image={badge.image}
              description={badge.description}
              points={badge.points}
              progress={updateBadgeProgress(badge.id, stats)}
              threshold={badge.threshold}
              achieved={badge.achieved}
              date={badge.achieved ? badge.dateAchieved : undefined}
              unit={getBadgeUnit(badge.id)}
            />
          ))}
        />
      )}
      {selectedTags.includes(tags[6]) && (
        <BadgesWrap
          title={tags[6] + ":"}
          cards={strictStreakBadges.map((badge) => (
            <BadgeCard
              key={badge.id}
              name={badge.name}
              image={badge.image}
              description={badge.description}
              points={badge.points}
              progress={updateBadgeProgress(badge.id, stats)}
              threshold={badge.threshold}
              achieved={badge.achieved}
              date={badge.achieved ? badge.dateAchieved : undefined}
              unit={getBadgeUnit(badge.id)}
            />
          ))}
        />
      )}
      {selectedTags.includes(tags[7]) && <p>Currently we don't have badges for miscellaneous</p>}
    </div>
  );
};

export default BadgesWrapped;
