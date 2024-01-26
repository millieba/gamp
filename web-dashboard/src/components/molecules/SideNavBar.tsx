import ProfilePicture from "../atoms/ProfilePicture";
import NavItems from "../atoms/NavItems";

const SideNavBar = () => {

  return (
    <div className="bg-DarkNeutral100 py-6 px-6 h-screen sticky top-0 grid w-72">
      <ProfilePicture />
      <NavItems />
    </div>
  );
};

export default SideNavBar;
