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
} from "@heroicons/react/24/outline";

interface NavItemProps {
  href: string;
  children: ReactNode;
}

const SideNavBar = () => {
  const pathname = usePathname();

  const NavItem = ({ href, children }: NavItemProps) => (
    <Link
      href={href}
      className={`text-DarkNeutral1100 text-base font-semibold ${
        pathname === href && "bg-DarkNeutral0 rounded-full"
      } text-xl mb-4 px-8 py-2 relative hover:bg-DarkNeutral200 hover:rounded-full active:bg-DarkNeutral0`}
    >
      <div className="flex">{children}</div>
    </Link>
  );
  
  return (
    <div className="bg-DarkNeutral100 py-6 pr-16 pl-4 h-screen grid">
      <div className="flex flex-col">
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
        <NavItem href="/profile">
          <UserIcon className="h-5 w-5 text-DarkNeutral1100 mr-3" />
          Profile
        </NavItem>
        <NavItem href="/settings">
          <Cog6ToothIcon className="h-5 w-5 text-DarkNeutral1100 mr-3" />
          Settings
        </NavItem>
      </div>
    </div>
  );
};

export default SideNavBar;
