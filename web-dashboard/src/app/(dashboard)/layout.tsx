import SideNavBar from "../components/atoms/SideNavBar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <section>
            <div className="flex gap-4">
                <SideNavBar />
                <main className="pt-6">
                    {children}
                </main>
            </div>

        </section>
    )
}