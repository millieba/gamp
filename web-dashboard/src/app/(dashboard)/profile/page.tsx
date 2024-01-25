import FetchLanguages from "@/components/atoms/FetchLanguages";
import StatBox from "@/components/atoms/StatBox";

const ProfilePage = () => {
  return (
    <div>
      <h1 className="text-2xl">Profile</h1>
      <StatBox name={"Most used languages in repos"} description={"These r ur most used languages in the repos you have..."} content={<FetchLanguages />} />
    </div>
  );
};

export default ProfilePage;