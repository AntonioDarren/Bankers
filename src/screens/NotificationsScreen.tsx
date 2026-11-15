import React from 'react';
import {
  ArrowLeft,
  TrendingUp,
  Coffee,
  ShieldCheck,
  Banknote,
  Sprout,
  Lightbulb,
  BellRing,
} from 'lucide-react';
import { useBankers, NotificationItem } from '../context/BankersContext';
import { StatusBar } from '../components/MobileChrome';

export const NotificationsScreen: React.FC = () => {
  const { notifications, setCurrentScreen } = useBankers();

  const todayNotifs = notifications.filter((n) => n.dayGroup === 'Today');
  const yesterdayNotifs = notifications.filter(
    (n) => n.dayGroup === 'Yesterday'
  );

  const renderNotifIcon = (iconType: NotificationItem['iconType']) => {
    switch (iconType) {
      case 'health':
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
        );
      case 'coffee':
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <Coffee className="w-4 h-4" />
          </div>
        );
      case 'emergency':
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
        );
      case 'transaction':
        return (
          <div className="w-9 h-9 rounded-xl bg-lime-50 border border-lime-100 flex items-center justify-center text-lime-700 shrink-0">
            <Banknote className="w-4 h-4" />
          </div>
        );
      case 'goal':
        return (
          <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 shrink-0">
            <Sprout className="w-4 h-4" />
          </div>
        );
      case 'insight':
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
            <Lightbulb className="w-4 h-4" />
          </div>
        );
    }
  };

  const renderCard = (item: NotificationItem) => (
    <div
      key={item.id}
      className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] p-3.5 flex items-start gap-3 transition-all hover:border-slate-200"
    >
      {renderNotifIcon(item.iconType)}

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {item.unread && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            )}
            <h3 className="text-[12.5px] font-bold text-slate-800 truncate">
              {item.title}
            </h3>
          </div>
          <span className="text-[10px] text-slate-400 font-medium shrink-0">
            {item.time}
          </span>
        </div>

        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
          {item.message}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-[#FAFAFA] flex flex-col text-slate-800">
      <StatusBar darkText={true} />

      {/* Header */}
      <div className="px-6 pt-3 pb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setCurrentScreen('home')}
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 active:scale-95 transition-all"
          aria-label="Back to Home"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
        </button>

        <h1 className="text-[15px] font-bold text-slate-800">Notifications</h1>

        <div className="w-8" />
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-8 space-y-4">
        {notifications.length === 0 ? (
          <div className="mt-12 bg-white rounded-3xl border border-slate-100 p-7 text-center shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-[#EBF1E8] text-[#5E7858] flex items-center justify-center mx-auto mb-3">
              <BellRing className="w-6 h-6" />
            </div>
            <h2 className="text-[14px] font-bold text-slate-800">
              No Notifications Yet
            </h2>
            <p className="text-[11.5px] text-slate-500 mt-1 leading-relaxed">
              New accounts start completely fresh (0). Notifications will appear
              automatically when you add a Wallet card or save an OCR
              transaction.
            </p>
          </div>
        ) : (
          <>
            {todayNotifs.length > 0 && (
              <div className="space-y-2.5">
                <h2 className="text-[11.5px] font-bold text-slate-500 px-0.5">
                  Today
                </h2>
                {todayNotifs.map(renderCard)}
              </div>
            )}

            {yesterdayNotifs.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <h2 className="text-[11.5px] font-bold text-slate-500 px-0.5">
                  Yesterday
                </h2>
                {yesterdayNotifs.map(renderCard)}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
