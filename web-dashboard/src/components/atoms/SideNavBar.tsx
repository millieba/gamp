'use client'
import Link from "next/link";
import { ReactNode } from "react";
import { usePathname } from 'next/navigation'

interface NavItemProps {
    href: string;
    children: ReactNode;
}
  

const SideNavBar = () => {
    const pathname = usePathname()
    
    const NavItem = ({ href, children }: NavItemProps) => (
        <Link href={href} className={`text-DarkNeutral1100 ${pathname === href && "bg-DarkNeutral0 rounded-full"} text-xl mb-4 px-8 py-2 relative hover:bg-DarkNeutral200 hover:rounded-full active:bg-DarkNeutral0`}>
            {children}
        </Link>
    );
  return (
    <div className="bg-DarkNeutral100 py-6 pr-16 pl-4 h-screen grid">
      <div className="flex flex-col">
      <NavItem href="/">Home</NavItem>
        <NavItem href="/badges">Badges</NavItem>
        <NavItem href="/stats">Stats</NavItem>
      </div>

      <div className="flex flex-col justify-end">
        <NavItem href="/profile">Profile</NavItem>
        <NavItem href="/settings">Settings</NavItem>
      </div>
    </div>
  );
};

export default SideNavBar;
