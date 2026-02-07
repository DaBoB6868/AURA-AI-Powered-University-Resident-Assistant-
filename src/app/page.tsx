'use client';

import { ChatComponent } from '@/components/ChatComponent';
import { Navigation } from '@/components/Navigation';
import RecycleChecker from '@/components/RecycleChecker';

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden px-3 py-3 sm:px-6 sm:py-4">
        <div className="max-w-5xl mx-auto h-full grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Chat - takes 2/3 on large screens, full width on mobile */}
          <div className="lg:col-span-2 min-h-0 overflow-hidden rounded-xl shadow-md border border-gray-200">
            <ChatComponent />
          </div>
          {/* Recycle Checker sidebar */}
          <aside className="lg:col-span-1">
            <RecycleChecker />
          </aside>
        </div>
      </div>
    </div>
  );
}

