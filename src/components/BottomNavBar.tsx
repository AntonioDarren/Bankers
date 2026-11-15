import React from 'react';
import { Home, Wallet, Plus, Clock, Smile } from 'lucide-react';
import { useBankers, ScreenRoute } from '../context/BankersContext';

export const BottomNavBar: React.FC<{ activeTab: 'home' | 'wallet' | 'history' | 'profile' }> = ({
  activeTab,
}) => {
  const { setCurrentScreen } = useBankers();

  const navItems: {
    id: 'home' | 'wallet' | 'history' | 'profile';
    label: string;
    route: ScreenRoute;
    icon: React.ReactNode;
  }[] = [
    { id: 'home', label: 'Home', route: 'home', icon: <Home className="w-5 h-5" /> },
    { id: 'wallet', label: 'Wallet', route: 'wallet', icon: <Wallet className="w-5 h-5" /> },
    { id: 'history', label: 'History', route: 'history', icon: <Clock className="w-5 h-5" /> },
    { id: 'profile', label: 'Profile', route: 'profile', icon: <Smile className="w-5 h-5" /> },
  ];

  return (
    <div className="sticky bottom-3 inset-x-0 px-4 z-30 pointer-events-none mt-auto">
      <div className="pointer-events-auto bg-[#1B2B23]/95 backdrop-blur-md border border-white/10 rounded-[26px] px-4 py-2 flex items-center justify-between shadow-2xl">
        {/* Left 2 Tabs: Home, Wallet */}
        {navItems.slice(0, 2).map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentScreen(item.route)}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1 transition-colors ${
                isActive ? 'text-[#4ADE80]' : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.icon}
              <span className={`text-[9.5px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}

        {/* Center Floating + Button (Upload Bill / OCR) */}
        <div className="-mt-6">
          <button
            type="button"
            onClick={() => setCurrentScreen('upload-bill')}
            className="w-12 h-12 rounded-full bg-[#689F77] hover:bg-[#5B8E69] active:scale-95 text-white flex items-center justify-center shadow-lg shadow-black/40 border-4 border-[#1D2B24] transition-all"
            aria-label="Upload Bill or Scan Receipt"
            title="Upload Bill / OCR Scanner"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>

        {/* Right 2 Tabs: History, Profile */}
        {navItems.slice(2, 4).map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setCurrentScreen(item.route)}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1 transition-colors ${
                isActive ? 'text-[#4ADE80]' : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.icon}
              <span className={`text-[9.5px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
