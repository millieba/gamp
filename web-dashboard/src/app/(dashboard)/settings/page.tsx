"use client";
import React, { useState, useEffect } from "react";
import MultiSelectDropdown from "@/components/atoms/MultiSelectDropdown";
import { useSyncContext } from "@/contexts/SyncContext";

const SettingsPage = () => {
  const { isLoading, stats } = useSyncContext();
  const [programmingLanguages, setProgrammingLanguages] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading && stats?.programmingLanguages) {
      const languageNames = stats.programmingLanguages.map((language) => language.name);
      setProgrammingLanguages(languageNames);
    }
  }, [isLoading, stats]);

  return (
    <>
      <h1 className="text-2xl">Settings</h1>
      <h2 className="text-md mt-6 font-bold">Exclude Programming Languages</h2>
      <p className="text-sm my-2">
        Select the programming languages you want to exclude from your stats. You can always change this later to
        include them again.
      </p>
      {isLoading ? (
        <p>Loading programming languages ...</p>
      ) : (
        <MultiSelectDropdown options={programmingLanguages} title="Select Languages to Exclude" />
      )}

      <h2 className="text-md mt-6 font-bold">Delete your Account</h2>
      <p className="text-sm my-2">
        Deleting your account will also delete all your data from our systems. This action cannot be undone.
      </p>
    </>
  );
};

export default SettingsPage;
