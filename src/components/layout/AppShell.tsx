import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { ShaderBackground } from "./ShaderBackground";
import { ToastContainer } from "../common/Toast";

interface Props {
  children: ReactNode;
}

/**
 * Single application shell.
 *
 * Desktop layout uses a deterministic CSS grid: a fixed 280px sidebar column
 * and a flexible content column. Because the sidebar is a real in-flow grid
 * item (not absolutely positioned), the content column can never overlap it
 * and never overflows the viewport. Exactly one page renders in <main>.
 */
export function AppShell({ children }: Props) {
  return (
    <div className="relative grid h-dvh w-screen grid-cols-1 overflow-hidden bg-background text-on-surface font-inter text-[16px] antialiased md:grid-cols-[280px_minmax(0,1fr)]">
      <ShaderBackground />
      <Sidebar />
      <main className="relative z-10 flex h-dvh min-w-0 flex-col overflow-y-auto overflow-x-hidden">
        {children}
      </main>
      <MobileNav />
      <ToastContainer />
    </div>
  );
}
