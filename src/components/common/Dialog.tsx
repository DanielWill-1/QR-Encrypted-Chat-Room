import type { ReactNode } from "react";
import { MaterialIcon } from "./MaterialIcon";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Dialog({ open, onClose, title, children }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="glass-level-2 rounded-xl w-full max-w-md p-xl flex flex-col gap-lg relative z-10">
        <div className="flex items-center justify-between">
          <h2 className="text-title-md text-primary">{title}</h2>
          <button onClick={onClose} className="p-xs rounded-full hover:bg-white/5 transition-colors">
            <MaterialIcon name="close" size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
