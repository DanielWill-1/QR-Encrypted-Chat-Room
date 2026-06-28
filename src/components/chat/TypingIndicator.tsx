export function TypingIndicator() {
  return (
    <div className="flex flex-col gap-xs max-w-[85%] md:max-w-[70%]">
      <div className="flex items-end gap-sm">
        <div className="w-8 h-8 rounded-full bg-surface-variant shrink-0 border border-white/10 mb-2" />
        <div className="msg-received rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1 h-10">
          <span className="w-1.5 h-1.5 bg-on-surface-variant rounded-full typing-dot" />
          <span className="w-1.5 h-1.5 bg-on-surface-variant rounded-full typing-dot" />
          <span className="w-1.5 h-1.5 bg-on-surface-variant rounded-full typing-dot" />
        </div>
      </div>
    </div>
  );
}
