'use client';

import { useState } from 'react';
import { PDFUploadComponent } from '@/components/PDFUploadComponent';
import { ChatComponent } from '@/components/ChatComponent';
import { Menu, X } from 'lucide-react';

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-80' : 'w-0'
        } bg-white shadow-lg transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-indigo-600">Dorm RA Bot</h1>
          <p className="text-xs text-gray-500 mt-1">Community Guide Assistant</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <PDFUploadComponent />
        </div>

        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <p className="text-xs text-gray-600">
            💡 <strong>Tip:</strong> Upload your dorm's community guide PDFs to
            enable the chatbot to answer questions!
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600" />
            )}
          </button>

          <div>
            <h2 className="text-lg font-semibold text-gray-800">Chat Assistant</h2>
            <p className="text-xs text-gray-500">Ask questions about dorm policies</p>
          </div>

          <div className="w-8" />
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">
          <ChatComponent />
        </div>
      </div>
    </div>
  );
}

