import Link from 'next/link';

const SideNavBar = () => {
    return (
        <div>
            <Link href="/">
                Home
            </Link>
            <Link href="/badges">
                Badges
            </Link>
            <Link href="/stats">
                Stats
            </Link>
            <Link href="/settings">
                Settings
            </Link>
        </div>
    );
}

export default SideNavBar;
