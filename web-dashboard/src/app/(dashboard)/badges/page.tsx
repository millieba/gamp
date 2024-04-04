"use client";
import PageHeading, { PageHeadingSkeleton } from "@/components/atoms/PageHeading";
import BadgesDropDown, { BadgesDropDownSkeleton } from "@/components/atoms/badges/BadgesDropDown";
import { useSyncContext } from "@/contexts/SyncContext";

const BadgePageSkeleton = () => {
  return (
    <>
      <PageHeadingSkeleton />
      <BadgesDropDownSkeleton />
    </>
  );
};

const BadgesPage = () => {
  const { isLoading } = useSyncContext();

  return isLoading ? (
    <BadgePageSkeleton />
  ) : (
    <>
      <PageHeading title="Badges" />
      <BadgesDropDown />
    </>
  );
};

export default BadgesPage;
