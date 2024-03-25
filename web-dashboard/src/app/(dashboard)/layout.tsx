"use client";
import SideNavBar from "@/components/molecules/SideNavBar";
import { Providers } from "./providers";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <section>
        <div className="flex gap-4">
          <div className="w-72">
            <SideNavBar />
          </div>
          <main className="pt-6 w-full mr-4 mb-4">
            <div className="m-2">{children}</div>
          </main>
        </div>
      </section>
    </Providers>
  );
}
