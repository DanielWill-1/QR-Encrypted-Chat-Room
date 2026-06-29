We have a React + TypeScript + Vite application for an ephemeral P2P chat (GhostLink).

Current behavior:

- Creating a session succeeds.
- The session appears correctly in Active Sessions.
- The signaling server is running.
- The Vite dev server is running.
- Session persistence appears to work.

However, immediately after creating a session (or switching back into an existing session), the application crashes and the ErrorBoundary displays:

"Maximum update depth exceeded"

Console output also contains:

"The result of getSnapshot should be cached to avoid an infinite loop."

The stack trace consistently points to:

MessageTimeline.tsx
ChatView.tsx
AppShell.tsx

React reports that MessageTimeline is causing an infinite render loop.

YOUR TASK

Do NOT blindly suppress errors.

Do NOT disable React StrictMode.

Do NOT add arbitrary useMemo/useCallback everywhere.

Instead perform a full root-cause analysis.

Specifically:

1. Inspect MessageTimeline.tsx.
   - Look for infinite render loops.
   - Check every useEffect.
   - Check every useLayoutEffect.
   - Check every setState call.
   - Check any derived state.

2. Inspect ChatView.tsx.
   - Verify props are stable.
   - Check whether it recreates objects/arrays/functions every render.
   - Ensure it is not forcing MessageTimeline to rerender infinitely.

3. Inspect every external store.
   Especially:
   - useSyncExternalStore
   - Zustand
   - custom stores
   - EventEmitter stores
   - session stores
   - message stores

4. Verify every getSnapshot implementation.

A snapshot MUST return the exact same object reference if nothing changed.

Bad:

return {
    messages: store.messages
}

Good:

return store.messages

or another stable reference.

5. Inspect every selector.

Look for things like:

state => [...state.messages]

state => ({ messages: state.messages })

state => state.messages.sort(...)

state => state.messages.map(...)

inside selectors.

Selectors must not create new arrays or objects on every render.

6. Verify subscriptions.

Ensure subscribe() does not itself update state.

Ensure listeners are cleaned up correctly.

7. Check for effects like:

useEffect(() => {
    setMessages(...)
}, [messages])

or

useEffect(() => {
    setState(...)
})

without proper dependency control.

8. Verify no component is mutating store state during render.

9. Check if navigation into ChatView immediately dispatches an action that causes another navigation or store update.

10. Trace the render lifecycle from:

Create Session
↓
Navigate to ChatView
↓
MessageTimeline mounts
↓
Crash

Find the exact state update responsible.

REQUIRED OUTPUT

Do not simply "fix" things.

Instead provide:

1. Root cause.

2. Why React enters an infinite update loop.

3. Which file.

4. Which line.

5. Why that line is wrong.

6. The correct implementation.

Then implement the fix.

After fixing:

- verify session creation
- verify reopening existing sessions
- verify switching sessions
- verify no infinite renders
- verify no React warnings remain
- verify no unnecessary rerenders

Only modify code directly related to the bug.

Do not refactor unrelated files.

Do not change application behavior except to eliminate the render loop.

Finally explain exactly why the fix works.