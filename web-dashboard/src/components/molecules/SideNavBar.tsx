import ProfilePicture from "../atoms/ProfilePicture";
import NavItems from "../atoms/NavItems";

const SideNavBar = () => {

  return (
    <div className="bg-DarkNeutral100 py-6 pr-4 pl-4 h-screen sticky top-0 grid">
      <ProfilePicture />
      <NavItems />
    </div>
  );
};

export default SideNavBar;
