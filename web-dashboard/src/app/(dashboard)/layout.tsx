import SideNavBar from "../components/atoms/SideNavBar"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <section>
            <SideNavBar />
            {children}
        </section>
    )
}