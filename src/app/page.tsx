'use client';

import { ChatComponent } from '@/components/ChatComponent';
import { Navigation } from '@/components/Navigation';

export default function Home() {
  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Navigation */}
      <Navigation />

      {/* Main Chat Area */}
      <div className="flex-1 overflow-hidden">
        <ChatComponent />
      </div>
    </div>
  );
}

