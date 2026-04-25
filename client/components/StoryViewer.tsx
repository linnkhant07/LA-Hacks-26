'use client';

// StoryViewer is the top-level shell component for the storybook experience.
// The actual logic lives in app/story/[id]/page.tsx — this component is
// available for Julia to style or for future refactoring into a standalone unit.
//
// Right now it just renders {children} but can grow into a layout wrapper
// (e.g. adding side panels, progress bars, ADHD engagement overlays).

interface StoryViewerProps {
  children: React.ReactNode;
  title?: string;
}

export default function StoryViewer({ children, title }: StoryViewerProps) {
  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {title && (
        <header className="px-6 py-3 bg-gray-900 border-b border-gray-800 text-sm text-gray-400">
          {title}
        </header>
      )}
      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
}
