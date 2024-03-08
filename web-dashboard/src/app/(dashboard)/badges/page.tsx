"use client";
import BadgesDropDown from "@/components/atoms/badges/BadgesDropDown";
import { useSyncContext } from "@/contexts/SyncContext";

const BadgesPage = () => {
  const { isLoading } = useSyncContext();

  return (
    <div>
      <h1 className="text-2xl">Badges</h1>
      {isLoading ? <p>Loading...</p> : <BadgesDropDown />}
    </div>
  );
};

export default BadgesPage;
