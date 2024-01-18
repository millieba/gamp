"use client";
import SideNavBar from "@/components/atoms/SideNavBar";
import { Providers } from './providers';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {


    return (
        <Providers>
            <section>
                <div className="flex gap-4">
                    <SideNavBar />
                    <main className="pt-6">
                        {children}
                    </main>
                </div>
            </section>
        </Providers>
    )
}