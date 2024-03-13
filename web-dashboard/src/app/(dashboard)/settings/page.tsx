"use client";
import { useState, useEffect } from "react";
import MultiSelectDropdown from "@/components/atoms/MultiSelectDropdown";
import { useSyncContext } from "@/contexts/SyncContext";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface CheckboxState {
  strictStreak: boolean;
  workdayStreak: boolean;
}

// Component to display a setting box with a title, description and children.
const SettingBox = ({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) => (
  <div className="bg-DarkNeutral300 rounded-lg shadow-lg px-4 py-2 mb-4">
    <h2 className="text-lg font-bold">{title}</h2>
    <p className="text-sm my-2">{description}</p>
    {children}
  </div>
);

const SettingsPage = () => {
  const { isLoading, stats, preferences, setPreferences } = useSyncContext();
  const [programmingLanguages, setProgrammingLanguages] = useState<string[]>([]);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [checkboxState, setCheckboxState] = useState<CheckboxState>({
    strictStreak: false,
    workdayStreak: false,
  });
  const [changesMade, setChangesMade] = useState<boolean>(false);
  const { data: session, status } = useSession();
  const router = useRouter();

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
      setPreferences(preferences); // Update context with new preferences
      setChangesMade(false); // Reset changesMade state (don't need to save the same changes twice!)
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async () => {
    try {
      if (session?.user?.userId) {
        const res = await fetch("api/user", {
          method: "DELETE",
          body: JSON.stringify(session?.user?.userId),
          headers: {
            "content-type": "application/json",
          },
        });

        if (res.ok) {
          router.push("/delete-success"); // Redirect to the success page
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
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
        <button
          className="text-DarkNeutral1100 font-semibold px-4 py-1 rounded-full bg-Magenta600 hover:bg-pink-600 mb-2"
          onClick={handleDelete}
        >
          Delete my Account
        </button>
      </SettingBox>

      <button
        className={`mt-2 font-semibold mb-4 px-4 py-2 rounded-full ${
          changesMade
            ? "text-DarkNeutral1100 bg-Magenta600 hover:bg-pink-600"
            : "bg-DarkNeutral400 text-DarkNeutral700 cursor-not-allowed"
        }`}
        onClick={handleSave}
        disabled={!changesMade}
      >
        Save
      </button>
    </>
  );
};

export default SettingsPage;
