"use client";
import { useState, useEffect } from "react";
import MultiSelectDropdown from "@/components/atoms/MultiSelectDropdown";
import { useSyncContext } from "@/contexts/SyncContext";
import DeleteAccountModal from "@/components/atoms/settings/DeleteAccountModal";
import Button from "@/components/atoms/Button";
import SettingBox from "@/components/atoms/settings/SettingBox";

interface CheckboxState {
  strictStreak: boolean;
  workdayStreak: boolean;
}

const SettingsPage = () => {
  const { isLoading, stats, preferences, setPreferences } = useSyncContext();
  const [programmingLanguages, setProgrammingLanguages] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [checkboxState, setCheckboxState] = useState<CheckboxState>({
    strictStreak: false,
    workdayStreak: false,
  });
  const [changesMade, setChangesMade] = useState<boolean>(false);
  const [showConfirmation, setShowConfirmation] = useState(false); // State to control visibility of the confirmation modal

  useEffect(() => {
    if (preferences) {
      setSelectedLanguages(preferences.excludeLanguages);
      setCheckboxState({
        strictStreak: preferences.showStrictStreak ?? false,
        workdayStreak: preferences.showWorkdayStreak ?? false,
      });
    }
  }, [preferences]);

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
      if (res.ok) {
        setPreferences(preferences); // Update context with new preferences
        setChangesMade(false); // Reset changesMade state (don't need to save the same changes twice!)
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="mr-4">
      <h1 className="text-2xl mb-3">Settings</h1>
      <SettingBox
        title="Exclude Programming Languages"
        description="Select the programming languages you want to exclude from your stats. You can always change this later to include them again."
      >
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
      </SettingBox>

      <SettingBox
        title="Streak Types"
        description="Choose which types of streaks you want to see in your stats. You can always change this later."
      >
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
      </SettingBox>

      <SettingBox
        title="Delete your Account"
        description="Deleting your account will delete all your data from our systems and revoke this app's access to your GitHub account. This action cannot be undone."
      >
        <Button
          label="Delete my Account"
          clickHandler={() => setShowConfirmation(true)} // Open the delete account modal when clicked
        />
        <DeleteAccountModal isOpen={showConfirmation} onClose={() => setShowConfirmation(false)} />
      </SettingBox>

      <div className="ml-2">
        <Button label="Save" isDisabled={!changesMade} clickHandler={handleSave} />
      </div>
    </div>
  );
};

export default SettingsPage;
