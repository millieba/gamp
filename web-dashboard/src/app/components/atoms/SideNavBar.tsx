import Link from 'next/link';

const SideNavBar = () => {
    return (
        <div className="bg-gray-800 py-6 pr-16 pl-4 h-screen grid">
            <div className="flex flex-col">
                <Link href="/" className="text-white text-xl mb-4 hover:text-blue-500">
                    Home
                </Link>
                <Link href="/badges" className="text-white text-xl mb-4 hover:text-blue-500">
                    Badges
                </Link>
                <Link href="/stats" className="text-white text-xl mb-4 hover:text-blue-500">
                    Stats
                </Link>
            </div>

            <div className="flex flex-col justify-end">
                <Link href="/profile" className="text-white text-xl mb-4 hover:text-blue-500">
                    Profile
                </Link>
                <Link href="/settings" className="text-white text-xl hover:text-blue-500">
                    Settings
                </Link>
            </div>
        </div>
    );
}

export default SideNavBar;
