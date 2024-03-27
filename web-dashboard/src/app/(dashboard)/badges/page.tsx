"use client";
import PageHeading from "@/components/atoms/PageHeading";
import BadgesDropDown from "@/components/atoms/badges/BadgesDropDown";
import { useSyncContext } from "@/contexts/SyncContext";

const BadgesPage = () => {
  const { isLoading } = useSyncContext();

  return (
    <>
      <PageHeading title="Badges" />
      {isLoading ? <p>Loading...</p> : <BadgesDropDown />}
    </>
  );
};

export default BadgesPage;
