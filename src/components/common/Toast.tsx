import { useStore } from "@/state/store";
import { MaterialIcon } from "./MaterialIcon";

const ICONS: Record<string, string> = {
  info: "info",
  success: "check_circle",
  error: "error",
  warning: "warning",
};

const COLORS: Record<string, string> = {
  info: "text-secondary border-secondary/30",
  success: "text-tertiary border-tertiary/30",
  error: "text-error border-error/30",
  warning: "text-on-surface-variant border-outline/30",
};

export function ToastContainer() {
  const toasts = useStore((s) => s.toasts);
  const removeToast = useStore((s) => s.removeToast);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-sm">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`glass-level-2 rounded-lg px-md py-sm flex items-center gap-sm border ${COLORS[t.type]} animate-[slideUp_0.3s_ease-out]`}
        >
          <MaterialIcon name={ICONS[t.type]} size={16} />
          <span className="text-body-sm text-on-surface">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="ml-auto text-on-surface-variant hover:text-on-surface">
            <MaterialIcon name="close" size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
