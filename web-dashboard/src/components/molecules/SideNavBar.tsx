import ProfilePicture from "../atoms/ProfilePicture";
import NavItems from "../atoms/NavItems";

const SideNavBar = () => {
  return (
    <div className="bg-DarkNeutral100 py-6 px-6 h-screen sticky top-0 flex flex-col justify-between overflow-auto w-72">
      <div className=" mb-6">
        <ProfilePicture />
      </div>
      <NavItems />
    </div>
  );
};

export default SideNavBar;
