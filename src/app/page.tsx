'use client';

import { ChatComponent } from '@/components/ChatComponent';
import { Navigation } from '@/components/Navigation';
import { RASelector } from '@/components/RASelector';
import RecycleChecker from '@/components/RecycleChecker';
import FAQSection from '@/components/FAQSection';

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Navigation */}
      <Navigation />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden px-3 py-3 sm:px-6 sm:py-4">
        <div className="max-w-7xl mx-auto h-full grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left Sidebar: RA Selector */}
          <aside className="lg:col-span-1 overflow-y-auto">
            <RASelector />
          </aside>

          {/* Chat - center */}
          <div className="lg:col-span-2 min-h-0 overflow-hidden rounded-xl shadow-md border border-gray-200">
            <ChatComponent />
          </div>

          {/* Right Sidebar: RecycleChecker + FAQ */}
          <aside className="lg:col-span-1 space-y-4 overflow-y-auto">
            <RecycleChecker />
            <FAQSection />
          </aside>
        </div>
      </div>
    </div>
  );
}

