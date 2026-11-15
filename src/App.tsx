import React from 'react';
import {
  BankersProvider,
  useBankers,
  ScreenRoute,
} from './context/BankersContext';
import { SignUpScreen } from './screens/SignUpScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { SignInScreen } from './screens/SignInScreen';
import { HomeScreen } from './screens/HomeScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { WalletScreen } from './screens/WalletScreen';
import { AddWalletScreen } from './screens/AddWalletScreen';
import { UploadBillScreen } from './screens/UploadBillScreen';
import { EditTransactionScreen } from './screens/EditTransactionScreen';
import { TransactionSavedScreen } from './screens/TransactionSavedScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';
import { Smartphone, Database, Sparkles, RotateCcw } from 'lucide-react';

const BankersViewport: React.FC = () => {
  const {
    currentScreen,
    setCurrentScreen,
    onboardingStep,
    isSupabaseConnected,
    supabaseProjectName,
    setShowSupabaseModal,
    loadSamplePdfDataIntoAccount,
    resetAccountToDefault,
  } = useBankers();

  const quickNavButtons: { label: string; route: ScreenRoute }[] = [
    { label: '1. Sign Up', route: 'signup' },
    { label: `Questions (${onboardingStep + 1}/8)`, route: 'onboarding' },
    { label: '2. Sign In', route: 'signin' },
    { label: '3. Home', route: 'home' },
    { label: '4. Notif', route: 'notifications' },
    { label: '5. Profile', route: 'profile' },
    { label: '6. Wallet', route: 'wallet' },
    { label: '7. Add Card', route: 'add-wallet' },
    { label: '8. Upload OCR', route: 'upload-bill' },
    { label: '9. Edit Tx', route: 'edit-transactions' },
  ];

  const renderScreen = () => {
    switch (currentScreen) {
      case 'signup':
        return <SignUpScreen />;
      case 'onboarding':
        return <OnboardingScreen />;
      case 'signin':
        return <SignInScreen />;
      case 'home':
        return <HomeScreen />;
      case 'notifications':
        return <NotificationsScreen />;
      case 'profile':
        return <ProfileScreen mode="main" />;
      case 'my-profile':
        return <ProfileScreen mode="detail" />;
      case 'wallet':
        return <WalletScreen />;
      case 'add-wallet':
        return <AddWalletScreen />;
      case 'history':
        return <HistoryScreen />;
      case 'upload-bill':
        return <UploadBillScreen />;
      case 'edit-transactions':
        return <EditTransactionScreen />;
      case 'transaction-saved':
        return <TransactionSavedScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0D1511] text-white flex flex-col items-center justify-start sm:justify-center sm:py-5 sm:px-4">
      {/* Top Laptop Preview Switcher Bar */}
      <div className="hidden sm:flex flex-wrap items-center justify-center gap-1.5 mb-3.5 max-w-[980px] bg-[#17231D] border border-white/10 px-3 py-2 rounded-2xl shadow-xl text-[11px]">
        <div className="flex items-center gap-1.5 pr-2 border-r border-white/10 text-[#4ADE80] font-bold">
          <Smartphone className="w-3.5 h-3.5" />
          <span>BANKERS</span>
        </div>

        {quickNavButtons.map((btn) => (
          <button
            key={btn.route}
            type="button"
            onClick={() => setCurrentScreen(btn.route)}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
              currentScreen === btn.route
                ? 'bg-[#738F6D] text-white shadow-xs'
                : 'text-slate-300 hover:bg-white/5'
            }`}
          >
            {btn.label}
          </button>
        ))}

        <button
          type="button"
          onClick={resetAccountToDefault}
          className="px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 bg-rose-950/50 hover:bg-rose-900/60 text-rose-200 border border-rose-500/30 transition-all"
          title="Reset current account back to default (0 cards, 0 transactions, 0 notifications)"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Default (0)</span>
        </button>

        <button
          type="button"
          onClick={loadSamplePdfDataIntoAccount}
          className="px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 bg-[#26382E] hover:bg-[#31473B] text-emerald-300 border border-emerald-500/30 transition-all"
          title="Populate current account with the PDF sample cards, balances, and transactions"
        >
          <Sparkles className="w-3 h-3" />
          <span>Load PDF Sample Data</span>
        </button>

        <button
          type="button"
          onClick={() => setShowSupabaseModal(true)}
          className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 border transition-all ${
            isSupabaseConnected
              ? 'bg-emerald-950/70 border-emerald-500/40 text-[#4ADE80]'
              : 'bg-amber-950/40 border-amber-500/30 text-amber-300 hover:bg-amber-950/60'
          }`}
          title="Configure Supabase Auth & PostgreSQL Database"
        >
          <Database className="w-3 h-3" />
          <span>
            {isSupabaseConnected
              ? `Supabase: ${supabaseProjectName}`
              : 'Supabase DB'}
          </span>
        </button>
      </div>

      {/* Mobile Device Bezel Frame (iOS / Android 392x844 viewport) */}
      <div
        className={`w-full sm:w-[392px] sm:h-[844px] min-h-screen sm:min-h-0 ${
          currentScreen === 'home' ? 'bg-[#1D2B24]' : 'bg-white'
        } sm:rounded-[42px] sm:border-[10px] sm:border-[#222D27] shadow-[0_25px_70px_rgba(0,0,0,0.65)] overflow-hidden relative flex flex-col`}
      >
        <div className="flex-1 w-full overflow-y-auto overflow-x-hidden mobile-scroll flex flex-col">
          {renderScreen()}
        </div>
      </div>

      {/* Supabase Auth & PostgreSQL Setup Modal */}
      <SupabaseSetupModal />
    </div>
  );
};

export function App() {
  return (
    <BankersProvider>
      <BankersViewport />
    </BankersProvider>
  );
}

export default App;
