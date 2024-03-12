"use client";
import { useState, useEffect } from "react";
import MultiSelectDropdown from "@/components/atoms/MultiSelectDropdown";
import { useSyncContext } from "@/contexts/SyncContext";

const SettingsPage = () => {
  const { isLoading, stats, setPreferences } = useSyncContext();
  const [programmingLanguages, setProgrammingLanguages] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [checkboxState, setCheckboxState] = useState<{ [key: string]: boolean }>({
    strictStreak: false,
    workdayStreak: false,
  });
  const [changesMade, setChangesMade] = useState<boolean>(false);

  // Fetch user preferences from database on page load
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const res = await (await fetch("/api/preferences")).json();
        console.log(res.preferences.excludeLanguages);
        const excludedLanguages = res.preferences.excludeLanguages || [];

        setSelectedLanguages(excludedLanguages);
        setCheckboxState({
          strictStreak: res.preferences.showStrictStreak ?? false,
          workdayStreak: res.preferences.showWorkdayStreak ?? false,
        });
      } catch (error) {
        console.error("An error occurred while fetching preferences:", error);
      }
    };

    fetchPreferences();
  }, []);

  useEffect(() => {
    if (!isLoading && stats?.programmingLanguages) {
      const languageNames = stats.programmingLanguages.map((language) => language.name).sort();
      setProgrammingLanguages(languageNames);
    }
  }, [isLoading, stats]);

  const handleDropdownChange = (selectedOptions: string[]) => {
    setSelectedLanguages(selectedOptions);
    setChangesMade(true);
  };

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setCheckboxState((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
    setChangesMade(true);
  };

  const handleSave = async () => {
    const preferences = {
      excludeLanguages: selectedLanguages,
      showStrictStreak: checkboxState.strictStreak,
      showWorkdayStreak: checkboxState.workdayStreak,
    };

    try {
      const res = await fetch("api/preferences", {
        method: "POST",
        body: JSON.stringify(preferences),
        headers: {
          "content-type": "application/json",
        },
      });
      setPreferences(preferences); // Update context with new preferences
      setChangesMade(false); // Reset changesMade state (don't need to save the same changes twice!)
    } catch (error) {
      console.error(error);
    }
  };

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
        <MultiSelectDropdown
          options={programmingLanguages}
          title="Select Languages to Exclude"
          selectedOptions={selectedLanguages}
          onChange={handleDropdownChange}
        />
      )}

      <h2 className="text-md mt-6 font-bold">Streak Types</h2>
      <p className="text-sm my-2">
        Choose which types of streaks you want to see in your stats. You can always change this later.
      </p>
      <div className="flex gap-6">
        <label>
          <input
            className="mr-2"
            type="checkbox"
            name="strictStreak"
            checked={checkboxState.strictStreak}
            onChange={handleCheckboxChange}
          />
          Strict streak
        </label>
        <label>
          <input
            className="mr-2"
            type="checkbox"
            name="workdayStreak"
            checked={checkboxState.workdayStreak}
            onChange={handleCheckboxChange}
          />
          Workday streak
        </label>
      </div>

      <h2 className="text-md mt-6 font-bold">Delete your Account</h2>
      <p className="text-sm my-2">
        Deleting your account will also delete all your data from our systems. This action cannot be undone.
      </p>

      {changesMade && (
        <button
          className="mt-5 text-DarkNeutral1100 font-semibold mb-4 px-4 py-1 rounded-full bg-Magenta600 hover:bg-pink-600"
          onClick={handleSave}
          disabled={!changesMade}
        >
          Save
        </button>
      )}
    </>
  );
};

export default SettingsPage;
