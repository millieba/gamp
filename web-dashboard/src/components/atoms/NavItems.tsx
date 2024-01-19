import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  ChartBarSquareIcon,
  Cog6ToothIcon,
  HomeIcon,
  StarIcon,
  UserIcon,
  ArrowRightEndOnRectangleIcon
} from "@heroicons/react/24/outline";
import { SignOutButton } from "../AuthButtons";

interface NavItemLinkProps {
  href: string;
  children: ReactNode;
}

interface NavItemButtonProps {
  children: ReactNode;
}

const NavItems = () => {
  const pathname = usePathname();

  const NavItemLink = ({ href, children }: NavItemLinkProps) => (
    <Link href={href}
      className={`text-DarkNeutral1100 text-base font-semibold ${pathname === href && "bg-DarkNeutral0 rounded-full"
        } text-xl mb-4 px-12 py-2 relative hover:bg-DarkNeutral200 hover:rounded-full active:bg-DarkNeutral0`}
    >
      <div className="flex">{children}</div>
    </Link>
  );

  const NavItemButton = ({ children }: NavItemButtonProps) => (
    <div
      className={`text-DarkNeutral1100 font-semibold mb-4 px-12 py-2 relative rounded-full hover:bg-DarkNeutral200 hover:rounded-full`}
    >
      <div className="flex">{children}</div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col">
        <NavItemLink href="/">
          <HomeIcon className="h-5 w-5 text-DarkNeutral1100 mr-3" />
          Home
        </NavItemLink>
        <NavItemLink href="/badges">
          <StarIcon className="h-5 w-5 text-DarkNeutral1100 mr-3" />
          Badges
        </NavItemLink>
        <NavItemLink href="/stats">
          <ChartBarSquareIcon className="h-5 w-5 text-DarkNeutral1100 mr-3" />
          Stats
        </NavItemLink>
      </div>

      <div className="flex flex-col justify-end">
        <NavItemLink href="/profile">
          <UserIcon className="h-5 w-5 text-DarkNeutral1100 mr-3" />
          Profile
        </NavItemLink>
        <NavItemLink href="/settings">
          <Cog6ToothIcon className="h-5 w-5 text-DarkNeutral1100 mr-3" />
          Settings
        </NavItemLink>
        <NavItemButton>
          <ArrowRightEndOnRectangleIcon className="h-5 w-5 text-DarkNeutral1100 mr-3" />
          <SignOutButton />
        </NavItemButton>
      </div>
    </>
  );
};

export default NavItems;