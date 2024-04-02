"use client";
import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  ChartBarSquareIcon,
  Cog6ToothIcon,
  HomeIcon,
  StarIcon,
  UserIcon,
  ArrowRightEndOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";

interface NavItemProps {
  href: string;
  children: ReactNode;
}

interface NavItemButtonProps {
  onClick: () => void;
  children: ReactNode;
}

const NavItems = () => {
  const pathname = usePathname();

  const NavItem = ({ href, children }: NavItemProps) => (
    <Link
      href={href}
      className={`text-DarkNeutral1100 font-semibold ${
        pathname === href && "bg-DarkNeutral0 rounded-full"
      } mb-4 pl-4 py-2 relative hover:bg-DarkNeutral200 hover:rounded-full active:bg-DarkNeutral0 flex items-center`}
    >
      {children}
    </Link>
  );

  const NavItemButton = ({ onClick, children }: NavItemButtonProps) => (
    <button
      onClick={onClick}
      className="text-DarkNeutral1100 font-semibold mb-2 pl-4 py-2 relative rounded-full hover:bg-DarkNeutral200 hover:rounded-full flex items-center"
    >
      {children}
    </button>
  );

  return (
    <>
      <div className="flex flex-col mb-4">
        <NavItem href="/">
          <HomeIcon className="h-5 w-5 text-DarkNeutral1100 mr-3" />
          Home
        </NavItem>
        <NavItem href="/badges">
          <StarIcon className="h-5 w-5 text-DarkNeutral1100 mr-3" />
          Badges
        </NavItem>
        <NavItem href="/stats">
          <ChartBarSquareIcon className="h-5 w-5 text-DarkNeutral1100 mr-3" />
          Stats
        </NavItem>
      </div>

      <div className="flex flex-col justify-end">
        <NavItem href="/settings">
          <Cog6ToothIcon className="h-5 w-5 text-DarkNeutral1100 mr-3" />
          Settings
        </NavItem>
        <NavItemButton onClick={signOut}>
          <ArrowRightEndOnRectangleIcon className="h-5 w-5 text-DarkNeutral1100 mr-3" />
          Sign Out
        </NavItemButton>
      </div>
    </>
  );
};

export default NavItems;
