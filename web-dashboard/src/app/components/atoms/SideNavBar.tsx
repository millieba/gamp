import Link from 'next/link';

const SideNavBar = () => {
    return (
        <div className="bg-gray-800 flex flex-col p-4">
            <Link href="/" className="text-white text-xl mb-4 hover:text-blue-500">
                Home
            </Link>
            <Link href="/badges" className="text-white text-xl mb-4 hover:text-blue-500">
                Badges
            </Link>
            <Link href="/stats" className="text-white text-xl mb-4 hover:text-blue-500">
                Stats
            </Link>
            <Link href="/settings" className="text-white text-xl mb-4 hover:text-blue-500">
                Settings
            </Link>
        </div>
    );
}

export default SideNavBar;
