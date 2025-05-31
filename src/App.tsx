import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/Dashboard';
import AIWritingJourneyPage from './pages/AIWritingJourneyPage';
import PromptEditorPage from './pages/PromptEditorPage';
import AIModelConfigurator from './components/AIModelConfigurator'; // New import
import { AIWritingJourneyProvider } from './context/AIWritingJourneyContext';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <Router>
      <AIWritingJourneyProvider>
        <div className="min-h-screen bg-gray-50" dir="rtl">
          <Navbar />
          <div className="flex">
            <Sidebar />
            <main className="flex-1 p-6 mr-64">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/ai-journey" element={<AIWritingJourneyPage />} />
                <Route path="/prompt-editor" element={<PromptEditorPage />} />
                <Route path="/ai-models" element={<AIModelConfigurator />} /> {/* New Route */}
              </Routes>
            </main>
          </div>
          <Toaster />
        </div>
      </AIWritingJourneyProvider>
    </Router>
  );
}

export default App;
