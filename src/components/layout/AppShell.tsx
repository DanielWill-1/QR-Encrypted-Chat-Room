import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { ShaderBackground } from "./ShaderBackground";
import { ToastContainer } from "../common/Toast";

interface Props {
  children: ReactNode;
}

export function AppShell({ children }: Props) {
  return (
    <div className="h-screen w-screen overflow-hidden flex text-on-surface font-[Inter] text-[16px]">
      <ShaderBackground />
      <Sidebar />
      <main className="flex-1 flex flex-col md:ml-64 relative h-full overflow-y-auto">
        {children}
      </main>
      <MobileNav />
      <ToastContainer />
    </div>
  );
}
