import React, { useState } from 'react';
import {
  Bell,
  Eye,
  EyeOff,
  Info,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  ArrowUpRight,
  X,
  LogOut,
} from 'lucide-react';
import { useBankers, formatRupiah } from '../context/BankersContext';
import {
  StatusBar,
  BankersMascot,
  CoffeeCupIllustration,
  PottedPlantIllustration,
} from '../components/MobileChrome';
import { BottomNavBar } from '../components/BottomNavBar';

export const HomeScreen: React.FC = () => {
  const {
    user,
    setCurrentScreen,
    isBalanceHidden,
    toggleBalanceHidden,
    financialHealthScore,
    financialHealthDelta,
    totalNetWorth,
    cashFlowMonthly,
    emergencyFundPercent,
    emergencyFundGoal,
    monthlySpendingTotal,
    spendingCategories,
    coffeeSavingPotential,
    planAdjustDelta,
    timeLeftMonths,
    onboardingAnswers,
    notifications,
    logoutAccount,
  } = useBankers();

  const [showHealthInfo, setShowHealthInfo] = useState(false);
  const [showSimulationModal, setShowSimulationModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [coffeeCupsCut, setCoffeeCupsCut] = useState(0);

  const hasUnreadNotifications = notifications.some((n) => n.unread);

  const getHealthStatusLabel = (score: number) => {
    if (score === 0) return 'No Data Yet';
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    return 'Needs Attention';
  };

  // SVG gauge parameters for Financial Health
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference -
    (Math.min(100, Math.max(0, financialHealthScore)) / 100) * circumference;

  // SVG Donut chart segments for Spending by Category
  const donutRadius = 28;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let cumulativePercent = 0;
  const hasSpending = spendingCategories.some((c) => c.percentage > 0);

  // Line chart points: flat at bottom (y=62) when 0
  const isZeroCashFlow = cashFlowMonthly === 0 && totalNetWorth === 0;
  const incomePoints = isZeroCashFlow
    ? '20,62 56,62 94,62 132,62'
    : '20,46 56,36 94,25 132,12';
  const incomeCoords = isZeroCashFlow
    ? [
        [20, 62],
        [56, 62],
        [94, 62],
        [132, 62],
      ]
    : [
        [20, 46],
        [56, 36],
        [94, 25],
        [132, 12],
      ];

  const expensePoints = isZeroCashFlow
    ? '20,62 56,62 94,62 132,62'
    : '20,56 56,49 94,45 132,33';
  const expenseCoords = isZeroCashFlow
    ? [
        [20, 62],
        [56, 62],
        [94, 62],
        [132, 62],
      ]
    : [
        [20, 56],
        [56, 49],
        [94, 45],
        [132, 33],
      ];

  return (
    <div className="relative min-h-full bg-[#1D2B24] text-slate-800 flex flex-col justify-between pb-3">
      {/* Top Light Section */}
      <div className="bg-[#F6F8F5] pb-3">
        <StatusBar darkText={true} />

        {/* Greeting & Notification Bell */}
        <div className="px-5 pt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <h1 className="text-[16.5px] font-medium text-slate-700 tracking-tight truncate">
              Good Morning,{' '}
              <span className="font-extrabold text-slate-900">
                {user.fullName}!
              </span>
            </h1>
            <BankersMascot size={28} className="animate-float shrink-0" />
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setCurrentScreen('notifications')}
              className="relative w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-sm"
              aria-label="Notifications"
              title="Open Notifications"
            >
              <Bell className="w-4 h-4 stroke-[2]" />
              {hasUnreadNotifications && (
                <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500" />
              )}
            </button>
            <button
              type="button"
              onClick={logoutAccount}
              className="w-9 h-9 rounded-full bg-white border border-slate-200/80 flex items-center justify-center text-slate-500 hover:text-rose-600 hover:bg-rose-50 active:scale-95 transition-all shadow-sm"
              title="Sign Out"
              aria-label="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Persona & Streak Pills */}
        <div className="px-5 pt-2 pb-3.5 flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200/80 shadow-sm text-[10.5px] font-semibold text-slate-700">
            <span role="img" aria-label="sprout">
              🌱
            </span>
            <span>{user.personaBadge}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-slate-200/80 shadow-sm text-[10.5px] font-semibold text-slate-700">
            <span role="img" aria-label="fire">
              🔥
            </span>
            <span>{user.streakWeeks} Week Streak</span>
          </div>
        </div>

        {/* Financial Health Card */}
        <div className="px-5 pb-4">
          <div className="bg-white rounded-[22px] p-4 shadow-sm border border-slate-200/60 relative overflow-hidden">
            <div className="flex items-center justify-between">
              {/* Left Score Info */}
              <div>
                <div className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500">
                  <span>Financial Health</span>
                  <button
                    type="button"
                    onClick={() => setShowHealthInfo(!showHealthInfo)}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label="Financial Health Info"
                  >
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-[44px] font-extrabold text-slate-800 leading-none tracking-tight mt-1.5">
                  {financialHealthScore}
                </div>

                <div className="text-[13px] font-bold text-[#2D6A4F] mt-1">
                  {getHealthStatusLabel(financialHealthScore)}
                </div>

                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EBF3EE] text-[#2D6A4F] text-[10px] font-semibold">
                  <ArrowUpRight className="w-3 h-3 stroke-[2.5]" />
                  <span>+{financialHealthDelta} points this month</span>
                </div>
              </div>

              {/* Right Circular Gauge with Geometric 'N' Emblem & Sparkles */}
              <div className="relative w-[104px] h-[104px] flex items-center justify-center mr-1">
                <span className="absolute -top-0.5 right-0 text-[#95B8A6] text-[11px] select-none">
                  ✦
                </span>
                <span className="absolute bottom-0 -left-2 text-[#95B8A6] text-[11px] select-none">
                  ✦
                </span>

                <svg className="w-full h-full -rotate-90" viewBox="0 0 92 92">
                  <circle
                    cx="46"
                    cy="46"
                    r={radius}
                    stroke="#E2E8F0"
                    strokeWidth="8.5"
                    fill="transparent"
                  />
                  {financialHealthScore > 0 && (
                    <circle
                      cx="46"
                      cy="46"
                      r={radius}
                      stroke="#2D6A4F"
                      strokeWidth="8.5"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-700 ease-out"
                    />
                  )}
                </svg>

                {/* Center Geometric N / Hourglass Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M6 4V20L12 14L6 8"
                      stroke="#2D6A4F"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18 20V4L12 10L18 16"
                      stroke="#52B788"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {showHealthInfo && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>
                  {financialHealthScore === 0
                    ? 'Fresh account: Add a wallet card and scan your first bill to calculate your Financial Health score.'
                    : 'Calculated from your Cash Flow, Emergency Fund, and spending habits.'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowHealthInfo(false)}
                  className="text-slate-400 hover:text-slate-600 ml-2"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Dark Green Sheet */}
      <div className="flex-1 bg-[#1D2B24] rounded-t-[30px] -mt-5 px-4 pt-5 pb-6 text-white space-y-3 shadow-2xl">
        {/* 1. Total New Worth Card */}
        <div className="bg-[#273830] rounded-[20px] p-4 border border-white/5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11.5px] text-slate-300 font-medium">
              <span>Total New Worth</span>
              <button
                type="button"
                onClick={toggleBalanceHidden}
                className="p-1 rounded-md hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
                title={
                  isBalanceHidden
                    ? 'Show Balances (Home Page Open)'
                    : 'Hide Balances (Home Page Close)'
                }
                aria-label="Toggle balance visibility"
              >
                {isBalanceHidden ? (
                  <EyeOff className="w-3.5 h-3.5" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowDetailsModal(true)}
              className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full bg-[#527961] hover:bg-[#5E896E] text-[10px] font-semibold text-white transition-colors"
            >
              <span>Details</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {/* Net Worth Amount */}
          <div className="mt-1 text-[21px] font-extrabold tracking-tight text-white">
            {isBalanceHidden ? '************' : formatRupiah(totalNetWorth)}
          </div>

          {/* Two Sub-metrics: Cash Flow & Emergency Fund */}
          <div className="mt-3 pt-3 border-t border-white/10 grid grid-cols-2 gap-2">
            {/* Cash Flow */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#1E2E26] border border-emerald-500/20 flex items-center justify-center text-[#4ADE80] shrink-0 mt-0.5">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-300">Cash Flow</div>
                <div className="text-[11.5px] font-bold text-[#4ADE80] truncate">
                  {isBalanceHidden
                    ? '************'
                    : `${cashFlowMonthly >= 0 ? '+' : '-'}${formatRupiah(
                        cashFlowMonthly
                      )}`}
                </div>
                <div className="text-[9.5px] text-slate-400 flex items-center gap-0.5">
                  <span className="text-[#4ADE80]">↑</span> vs last month
                </div>
              </div>
            </div>

            {/* Emergency Fund */}
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#1E2E26] border border-emerald-500/20 flex items-center justify-center text-[#4ADE80] shrink-0 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-slate-300">Emergency Fund</div>
                <div className="text-[11.5px] font-bold text-[#4ADE80]">
                  {emergencyFundPercent}%
                </div>
                <div className="text-[9.5px] text-slate-400 truncate">
                  {isBalanceHidden
                    ? 'of Rp ******* goal'
                    : `of ${formatRupiah(emergencyFundGoal)} goal`}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Side-by-Side Analytics Row: Cash Flow & Spending by Category */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Left: Cash Flow Line Chart Card */}
          <div className="bg-[#273830] rounded-[20px] p-3.5 border border-white/5 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-semibold text-slate-200">
                Cash Flow
              </div>
              <div className="text-[13px] font-extrabold text-[#4ADE80] mt-0.5">
                {isBalanceHidden
                  ? '**********'
                  : `${cashFlowMonthly >= 0 ? '+' : '-'}${formatRupiah(
                      cashFlowMonthly
                    )}`}
              </div>
              <div className="text-[9.5px] text-slate-400">vs last month</div>
            </div>

            {/* Dual-Line SVG Chart */}
            <div className="mt-2.5 pt-1">
              <svg viewBox="0 0 140 68" className="w-full h-16 overflow-visible">
                {[
                  { y: 10, label: '4M' },
                  { y: 28, label: '2M' },
                  { y: 46, label: '1M' },
                  { y: 62, label: '0' },
                ].map((row) => (
                  <g key={row.label}>
                    <text
                      x="0"
                      y={row.y + 3}
                      fill="#64748B"
                      fontSize="7.5"
                      fontWeight="600"
                    >
                      {row.label}
                    </text>
                    <line
                      x1="16"
                      y1={row.y}
                      x2="136"
                      y2={row.y}
                      stroke="#33473D"
                      strokeWidth="0.8"
                      strokeDasharray="2 2"
                    />
                  </g>
                ))}

                {/* Green Income Line */}
                <polyline
                  fill="none"
                  stroke="#4ADE80"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={incomePoints}
                />
                {incomeCoords.map(([cx, cy], i) => (
                  <circle
                    key={`inc-${i}`}
                    cx={cx}
                    cy={cy}
                    r="2.4"
                    fill="#4ADE80"
                  />
                ))}

                {/* Coral/Orange Expense Line */}
                <polyline
                  fill="none"
                  stroke="#FB923C"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={expensePoints}
                />
                {expenseCoords.map(([cx, cy], i) => (
                  <circle
                    key={`exp-${i}`}
                    cx={cx}
                    cy={cy}
                    r="2.2"
                    fill="#FB923C"
                  />
                ))}
              </svg>
            </div>
          </div>

          {/* Right: Spending by Category Donut Card */}
          <div className="bg-[#273830] rounded-[20px] p-3.5 border border-white/5 flex flex-col justify-between">
            <div className="text-[11px] font-semibold text-slate-200">
              Spending by Category
            </div>

            <div className="mt-2 flex items-center gap-2">
              {/* SVG Donut */}
              <div className="relative w-[68px] h-[68px] shrink-0 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 68 68">
                  <circle
                    cx="34"
                    cy="34"
                    r={donutRadius}
                    fill="transparent"
                    stroke="#33473D"
                    strokeWidth="7.5"
                  />
                  {hasSpending &&
                    spendingCategories.map((cat) => {
                      const strokeDasharray = `${
                        (cat.percentage / 100) * donutCircumference
                      } ${donutCircumference}`;
                      const strokeDashoffset = -(
                        (cumulativePercent / 100) *
                        donutCircumference
                      );
                      cumulativePercent += cat.percentage;

                      return (
                        <circle
                          key={cat.name}
                          cx="34"
                          cy="34"
                          r={donutRadius}
                          fill="transparent"
                          stroke={cat.color}
                          strokeWidth="7.5"
                          strokeDasharray={strokeDasharray}
                          strokeDashoffset={strokeDashoffset}
                        />
                      );
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-1">
                  <span className="text-[6.8px] font-bold text-white leading-tight">
                    {isBalanceHidden
                      ? '******'
                      : formatRupiah(monthlySpendingTotal)}
                  </span>
                  <span className="text-[6px] text-slate-400">This month</span>
                </div>
              </div>

              {/* Category Legend */}
              <div className="flex-1 space-y-1 min-w-0">
                {spendingCategories.map((cat) => (
                  <div
                    key={cat.name}
                    className="flex items-center justify-between text-[8px] text-slate-300"
                  >
                    <div className="flex items-center gap-1 truncate">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <span className="font-semibold text-slate-200 ml-1">
                      {cat.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 3. AI Insight Card */}
        <div className="bg-[#273830] rounded-[20px] p-4 border border-white/5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-[#4ADE80]" />
            <span>AI Insight</span>
          </div>

          <div className="mt-2.5 flex items-center gap-3">
            {/* Left Mascot Avatar */}
            <div className="w-10 h-10 rounded-full bg-[#1B2821] border border-white/10 flex items-center justify-center shrink-0">
              <BankersMascot size={26} />
            </div>

            {/* Center Insight Copy */}
            {monthlySpendingTotal === 0 && coffeeSavingPotential === 0 ? (
              <p className="text-[10.5px] text-slate-200 leading-relaxed flex-1">
                No spending recorded yet. Potential monthly savings:{' '}
                <span className="text-[#4ADE80] font-bold">
                  {isBalanceHidden ? '******' : formatRupiah(0)}
                </span>
                . Add a wallet or scan a bill to unlock AI insights!
              </p>
            ) : (
              <p className="text-[10.5px] text-slate-200 leading-relaxed flex-1">
                You spent 26% more on{' '}
                <span className="text-[#4ADE80] font-bold">Food</span> this week.
                Reducing coffee purchases could save around{' '}
                <span className="text-[#4ADE80] font-bold">
                  {isBalanceHidden
                    ? '******'
                    : formatRupiah(coffeeSavingPotential)}
                </span>{' '}
                this month.
              </p>
            )}

            {/* Right Coffee Illustration */}
            <div className="shrink-0">
              <CoffeeCupIllustration className="w-12 h-14" />
            </div>
          </div>

          {/* See Simulation Button */}
          <div className="mt-3 flex justify-center">
            <button
              type="button"
              onClick={() => setShowSimulationModal(true)}
              className="px-5 py-1.5 rounded-full bg-[#689F77] hover:bg-[#5B8E69] active:scale-95 text-[11px] font-semibold text-white shadow-sm transition-all"
            >
              See Simulation →
            </button>
          </div>
        </div>

        {/* 4. Bottom Goal & Plan Adjustment Cards Row */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Left: Score & Plan Adjust Card */}
          <div className="bg-[#273830] rounded-[20px] p-3.5 border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="font-mono text-[13px] font-bold text-[#FBBF24] tracking-tight">
                {financialHealthScore}
                <span className="text-slate-400 mx-0.5">-</span>
                {Math.max(0, financialHealthScore - 5)}
              </div>
              <div className="text-[10px] font-bold text-[#F87171]">
                {isBalanceHidden
                  ? '-Rp ***'
                  : planAdjustDelta === 0
                  ? formatRupiah(0)
                  : `-${formatRupiah(Math.abs(planAdjustDelta))}`}
              </div>
            </div>

            {/* Dual color progress bar */}
            <div className="my-2.5 w-full h-1.5 bg-[#1B2821] rounded-full overflow-hidden flex">
              <div
                className="h-full bg-[#F59E0B] rounded-l-full transition-all"
                style={{ width: financialHealthScore === 0 ? '0%' : '58%' }}
              />
              <div
                className="h-full bg-[#38BDF8] rounded-r-full transition-all"
                style={{ width: financialHealthScore === 0 ? '0%' : '26%' }}
              />
            </div>

            <button
              type="button"
              onClick={() => setShowSimulationModal(true)}
              className="w-full py-1.5 rounded-full bg-[#689F77] hover:bg-[#5B8E69] text-[10.5px] font-semibold text-white transition-colors"
            >
              Adjust Plan
            </button>
          </div>

          {/* Right: Time Left & Plant Card */}
          <div className="bg-[#273830] rounded-[20px] p-3.5 border border-white/5 flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-1">
              <div className="text-[10.5px] font-semibold text-slate-200">
                Time left
              </div>
              <div className="text-[9.5px] text-slate-400 mt-0.5">
                {timeLeftMonths} months left
              </div>
              <div className="mt-2.5 w-full h-1.5 bg-[#1B2821] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#38BDF8] rounded-full transition-all"
                  style={{ width: timeLeftMonths === 0 ? '0%' : '65%' }}
                />
              </div>
            </div>
            <PottedPlantIllustration className="w-9 h-11 shrink-0" />
          </div>
        </div>
      </div>

      {/* Shared Floating Bottom Navigation Bar */}
      <BottomNavBar activeTab="home" />

      {/* Interactive AI Simulation Modal */}
      {showSimulationModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-[#23332B] border border-white/15 rounded-3xl p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#4ADE80]">
                <Sparkles className="w-4 h-4" />
                <span>AI Savings Simulator</span>
              </div>
              <button
                type="button"
                onClick={() => setShowSimulationModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11.5px] text-slate-300 leading-relaxed">
              See how reducing weekly coffee &amp; impulse FnB orders impacts your
              monthly savings and Financial Health score:
            </p>

            <div className="mt-4 bg-[#1A2620] rounded-2xl p-3.5 border border-white/5">
              <div className="flex justify-between text-[11px] mb-1.5">
                <span className="text-slate-300">Coffee cups reduced / month</span>
                <span className="font-bold text-[#4ADE80]">{coffeeCupsCut} cups</span>
              </div>
              <input
                type="range"
                min={0}
                max={15}
                value={coffeeCupsCut}
                onChange={(e) => setCoffeeCupsCut(Number(e.target.value))}
                className="w-full accent-[#4ADE80] cursor-pointer"
              />
              <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400">Monthly Savings</div>
                  <div className="text-[15px] font-extrabold text-[#4ADE80]">
                    +{formatRupiah(coffeeCupsCut * 30000)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400">Projected Score</div>
                  <div className="text-[15px] font-extrabold text-white">
                    {Math.min(
                      100,
                      financialHealthScore + Math.round(coffeeCupsCut * 2)
                    )}{' '}
                    <span className="text-[10px] text-[#4ADE80] font-normal">
                      / 100
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowSimulationModal(false)}
              className="mt-4 w-full py-2.5 rounded-full bg-[#689F77] hover:bg-[#5A8E68] text-[12px] font-semibold text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Net Worth & Onboarding Summary Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-[#23332B] border border-white/15 rounded-3xl p-5 text-white shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-bold text-white">
                Account &amp; Net Worth Details
              </h3>
              <button
                type="button"
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-[11.5px]">
              <div className="bg-[#1A2620] rounded-xl p-3 flex justify-between items-center">
                <span className="text-slate-300">Logged in Email</span>
                <span className="font-bold text-white">
                  {user.email || 'Not logged in'}
                </span>
              </div>
              <div className="bg-[#1A2620] rounded-xl p-3 flex justify-between items-center">
                <span className="text-slate-300">Total Net Worth</span>
                <span className="font-bold text-[#4ADE80]">
                  {isBalanceHidden ? '************' : formatRupiah(totalNetWorth)}
                </span>
              </div>
              <div className="bg-[#1A2620] rounded-xl p-3 flex justify-between items-center">
                <span className="text-slate-300">Monthly Cash Flow</span>
                <span className="font-bold text-[#4ADE80]">
                  {isBalanceHidden
                    ? '************'
                    : `+${formatRupiah(cashFlowMonthly)}`}
                </span>
              </div>
              <div className="bg-[#1A2620] rounded-xl p-3">
                <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-1">
                  Onboarding Preferences ({Object.keys(onboardingAnswers).length}{' '}
                  Answers)
                </div>
                <div className="text-slate-200 text-[11px]">
                  Persona:{' '}
                  <strong className="text-[#4ADE80]">{user.personaBadge}</strong> •
                  Report Frequency:{' '}
                  <strong className="capitalize">
                    {onboardingAnswers['report_frequency'] || 'Not set'}
                  </strong>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowDetailsModal(false)}
              className="mt-4 w-full py-2 rounded-full bg-[#689F77] hover:bg-[#5A8E68] text-[12px] font-semibold text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
