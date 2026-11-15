import React, { useState } from 'react';
import {
  ArrowLeft,
  ChevronRight,
  Settings,
  Clock,
  CreditCard,
  ClipboardList,
  SlidersHorizontal,
  Shield,
  HelpCircle,
  Fingerprint,
  MessageSquare,
  Pencil,
  LogOut,
  X,
  Check,
  Star,
  Send,
} from 'lucide-react';
import { useBankers, formatRupiah } from '../context/BankersContext';
import { StatusBar } from '../components/MobileChrome';
import { BottomNavBar } from '../components/BottomNavBar';

/**
 * Custom SVG Avatar matching the yellow circle + green-haired character from Page 5 of the PDF
 */
const ProfileAvatarIllustration: React.FC<{ size?: 'sm' | 'lg' }> = ({
  size = 'sm',
}) => {
  const dim = size === 'lg' ? 92 : 42;
  return (
    <svg
      width={dim}
      height={dim}
      viewBox="0 0 100 100"
      fill="none"
      className="rounded-full shrink-0 shadow-xs"
    >
      {/* Yellow circle background */}
      <circle cx="50" cy="50" r="50" fill="#FACC15" />
      {/* Green shirt shoulders */}
      <path
        d="M20 96C24 76 36 68 50 68C64 68 76 76 80 96"
        fill="#15803D"
      />
      {/* Neck & Face */}
      <rect x="43" y="52" width="14" height="18" rx="6" fill="#FDBA74" />
      <ellipse cx="50" cy="44" rx="16" ry="18" fill="#FED7AA" />
      {/* Stylish dark/green hair */}
      <path
        d="M33 42C32 27 42 20 54 22C64 23 69 31 66 42C62 35 55 32 45 34C38 35 35 39 33 42Z"
        fill="#14532D"
      />
      {/* Eyes & smile */}
      <circle cx="44" cy="44" r="1.8" fill="#1E293B" />
      <circle cx="56" cy="44" r="1.8" fill="#1E293B" />
      <path
        d="M46 51C48 53 52 53 54 51"
        stroke="#1E293B"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
};

export const ProfileScreen: React.FC<{ mode?: 'main' | 'detail' }> = ({
  mode = 'main',
}) => {
  const {
    user,
    updateUser,
    setCurrentScreen,
    logoutAccount,
    totalNetWorth,
    cashFlowMonthly,
    monthlySpendingTotal,
    financialHealthScore,
    feedbacks,
    submitUserFeedback,
  } = useBankers();

  const [editingField, setEditingField] = useState<{
    key: keyof typeof user | 'password';
    label: string;
    value: string;
  } | null>(null);

  const [activeInfoDialog, setActiveInfoDialog] = useState<{
    title: string;
    content: string;
  } | null>(null);

  const [showReportsModal, setShowReportsModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackStatus(null);
    setIsSubmittingFeedback(true);
    try {
      const res = await submitUserFeedback(feedbackText, feedbackRating);
      if (!res.success) {
        setFeedbackStatus({
          type: 'error',
          message: res.error || 'Could not save feedback.',
        });
      } else {
        setFeedbackText('');
        setFeedbackRating(5);
        setFeedbackStatus({
          type: 'success',
          message: 'Thank you! Your feedback has been saved to the database.',
        });
      }
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleSaveField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingField) return;
    if (editingField.key !== 'password') {
      updateUser({ [editingField.key]: editingField.value });
    }
    setEditingField(null);
  };

  if (mode === 'detail') {
    return (
      <div className="min-h-full bg-white flex flex-col justify-between text-slate-800">
        <div>
          <StatusBar darkText={true} />

          {/* Header */}
          <div className="px-6 pt-3 pb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setCurrentScreen('profile')}
              className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 active:scale-95 transition-all"
              aria-label="Back to Profile"
            >
              <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
            </button>
            <h1 className="text-[15px] font-bold text-slate-800">My Profile</h1>
            <div className="w-8" />
          </div>

          {/* Large Centered Avatar with Edit Badge */}
          <div className="py-3 flex justify-center">
            <div className="relative">
              <ProfileAvatarIllustration size="lg" />
              <button
                type="button"
                onClick={() =>
                  setEditingField({
                    key: 'fullName',
                    label: 'Full Name',
                    value: user.fullName,
                  })
                }
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#5E7858] text-white flex items-center justify-center border-2 border-white shadow-md"
                aria-label="Edit Profile"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Public Profile Card */}
          <div className="px-6 mt-2">
            <div className="bg-[#EEF2ED] rounded-2xl px-4 py-1 divide-y divide-slate-200/80">
              {/* Username */}
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Username
                  </div>
                  <div className="text-[12.5px] font-semibold text-slate-800 mt-0.5">
                    {user.username || '@john_doe'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingField({
                      key: 'username',
                      label: 'Username',
                      value: user.username || '@john_doe',
                    })
                  }
                  className="p-1.5 text-slate-500 hover:text-slate-800"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Bio */}
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Bio
                  </div>
                  <div className="text-[12.5px] font-semibold text-slate-800 mt-0.5">
                    {user.bio || 'Seize the day!'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingField({
                      key: 'bio',
                      label: 'Bio',
                      value: user.bio || 'Seize the day!',
                    })
                  }
                  className="p-1.5 text-slate-500 hover:text-slate-800"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Social Media Account */}
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Social Media Account
                  </div>
                  <div className="text-[12.5px] font-semibold text-[#5E7858] mt-0.5">
                    {user.socialMedia || 'Add Now'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingField({
                      key: 'socialMedia',
                      label: 'Social Media Account',
                      value:
                        user.socialMedia === 'Add Now'
                          ? ''
                          : user.socialMedia || '',
                    })
                  }
                  className="p-1.5 text-slate-500 hover:text-slate-800"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Private Information Section */}
          <div className="px-6 mt-4 pb-6">
            <h2 className="text-[13px] font-bold text-slate-700 mb-2 px-0.5">
              Private Information
            </h2>

            <div className="bg-[#EEF2ED] rounded-2xl px-4 py-1 divide-y divide-slate-200/80">
              {/* Full Name */}
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Full Name
                  </div>
                  <div className="text-[12.5px] font-semibold text-slate-800 mt-0.5">
                    {user.fullName}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingField({
                      key: 'fullName',
                      label: 'Full Name',
                      value: user.fullName,
                    })
                  }
                  className="p-1.5 text-slate-500 hover:text-slate-800"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Phone Number */}
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Phone Number
                  </div>
                  <div className="text-[12.5px] font-semibold text-slate-800 mt-0.5">
                    {user.phoneNumber || '+628127372****'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingField({
                      key: 'phoneNumber',
                      label: 'Phone Number',
                      value: user.phoneNumber || '+628127372****',
                    })
                  }
                  className="p-1.5 text-slate-500 hover:text-slate-800"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Email Address */}
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Email Address
                  </div>
                  <div className="text-[12.5px] font-semibold text-slate-800 mt-0.5">
                    {user.email || 'john***@gmail.com'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingField({
                      key: 'email',
                      label: 'Email Address',
                      value: user.email || '',
                    })
                  }
                  className="p-1.5 text-slate-500 hover:text-slate-800"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Change Password */}
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Change Password
                  </div>
                  <div className="text-[12.5px] font-semibold text-slate-800 mt-0.5">
                    ************
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingField({
                      key: 'password',
                      label: 'Change Password',
                      value: '',
                    })
                  }
                  className="p-1.5 text-slate-500 hover:text-slate-800"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Financial Profile */}
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-medium">
                    Financial Profile
                  </div>
                  <div className="text-[12.5px] font-semibold text-slate-800 mt-0.5 flex items-center gap-1">
                    <span role="img" aria-label="sprout">
                      🌱
                    </span>
                    <span>{user.personaBadge || 'Careful Saver'}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditingField({
                      key: 'personaBadge',
                      label: 'Financial Profile',
                      value: user.personaBadge || 'Careful Saver',
                    })
                  }
                  className="p-1.5 text-slate-500 hover:text-slate-800"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <BottomNavBar activeTab="profile" />

        {/* Edit Field Modal */}
        {editingField && (
          <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
            <form
              onSubmit={handleSaveField}
              className="w-full max-w-[330px] bg-white rounded-3xl p-5 shadow-2xl border border-slate-100"
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[14px] font-bold text-slate-800">
                  Edit {editingField.label}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <input
                type={editingField.key === 'password' ? 'password' : 'text'}
                autoFocus
                value={editingField.value}
                onChange={(e) =>
                  setEditingField({ ...editingField, value: e.target.value })
                }
                placeholder={`Enter ${editingField.label}`}
                className="w-full h-11 px-3.5 rounded-xl border border-slate-200 text-[13px] text-slate-800 focus:outline-none focus:border-[#738F6D]"
              />

              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingField(null)}
                  className="flex-1 py-2.5 rounded-full border border-slate-200 text-[12px] font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-full bg-[#738F6D] text-white text-[12px] font-semibold flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    );
  }

  // Main Profile Screen (Left side of Page 5)
  return (
    <div className="min-h-full bg-white flex flex-col justify-between text-slate-800">
      <div>
        <StatusBar darkText={true} />

        {/* Header */}
        <div className="px-6 pt-3 pb-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setCurrentScreen('home')}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 active:scale-95 transition-all"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.2]" />
          </button>
          <h1 className="text-[15px] font-bold text-slate-800">Profile</h1>
          <div className="w-8" />
        </div>

        {/* Hero User Card -> Click to open My Profile */}
        <div className="px-6 mt-1">
          <button
            type="button"
            onClick={() => setCurrentScreen('my-profile')}
            className="w-full bg-[#EEF2ED] hover:bg-[#E4ECE2] rounded-2xl p-3.5 flex items-center justify-between transition-colors text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <ProfileAvatarIllustration size="sm" />
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold text-slate-800 truncate">
                  {user.fullName}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {user.email || 'johndoe@gmail.com'}
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          </button>
        </div>

        {/* Account Details Section */}
        <div className="px-6 mt-4">
          <h2 className="text-[12.5px] font-bold text-slate-700 mb-2 px-0.5">
            Account Details
          </h2>
          <div className="bg-[#EEF2ED] rounded-2xl px-4 py-1 divide-y divide-slate-200/80">
            <button
              type="button"
              onClick={() => setCurrentScreen('my-profile')}
              className="w-full py-3 flex items-center justify-between text-left hover:opacity-80"
            >
              <div className="flex items-center gap-3">
                <Settings className="w-4 h-4 text-slate-600" />
                <span className="text-[12.5px] font-medium text-slate-700">
                  Settings
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentScreen('history')}
              className="w-full py-3 flex items-center justify-between text-left hover:opacity-80"
            >
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-600" />
                <span className="text-[12.5px] font-medium text-slate-700">
                  Transaction History
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => setCurrentScreen('wallet')}
              className="w-full py-3 flex items-center justify-between text-left hover:opacity-80"
            >
              <div className="flex items-center gap-3">
                <CreditCard className="w-4 h-4 text-slate-600" />
                <span className="text-[12.5px] font-medium text-slate-700">
                  Bank Account
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() => setShowReportsModal(true)}
              className="w-full py-3 flex items-center justify-between text-left hover:opacity-80"
            >
              <div className="flex items-center gap-3">
                <ClipboardList className="w-4 h-4 text-slate-600" />
                <span className="text-[12.5px] font-medium text-slate-700">
                  Reports
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Privacy & Support Section */}
        <div className="px-6 mt-4 pb-4">
          <h2 className="text-[12.5px] font-bold text-slate-700 mb-2 px-0.5">
            Privacy &amp; Support
          </h2>
          <div className="bg-[#EEF2ED] rounded-2xl px-4 py-1 divide-y divide-slate-200/80">
            <button
              type="button"
              onClick={() =>
                setActiveInfoDialog({
                  title: 'Preferences',
                  content:
                    'Currency: IDR (Rp) • OCR Language: Indonesian & English • Notification Alerts: Enabled.',
                })
              }
              className="w-full py-3 flex items-center justify-between text-left hover:opacity-80"
            >
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-4 h-4 text-slate-600" />
                <span className="text-[12.5px] font-medium text-slate-700">
                  Preferences
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveInfoDialog({
                  title: 'Privacy Policy',
                  content:
                    'Your financial records and OCR receipts are processed securely and isolated per account.',
                })
              }
              className="w-full py-3 flex items-center justify-between text-left hover:opacity-80"
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-slate-600" />
                <span className="text-[12.5px] font-medium text-slate-700">
                  Privacy Policy
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveInfoDialog({
                  title: 'Help & Support',
                  content:
                    'Need help scanning a receipt or managing wallets? Tap the + button at the bottom to scan bills using OCR.',
                })
              }
              className="w-full py-3 flex items-center justify-between text-left hover:opacity-80"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-4 h-4 text-slate-600" />
                <span className="text-[12.5px] font-medium text-slate-700">
                  Help &amp; Support
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            {/* Enable Finger Print / Face ID Toggle */}
            <div className="w-full py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-4 h-4 text-slate-600" />
                <span className="text-[12.5px] font-medium text-slate-700">
                  Enable Finger Print/Face ID
                </span>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={user.fingerprintEnabled}
                onClick={() =>
                  updateUser({ fingerprintEnabled: !user.fingerprintEnabled })
                }
                className={`w-10 h-6 rounded-full p-1 transition-colors flex items-center ${
                  user.fingerprintEnabled
                    ? 'bg-[#689F77] justify-end'
                    : 'bg-slate-300 justify-start'
                }`}
              >
                <span className="w-4 h-4 rounded-full bg-white shadow-xs" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setFeedbackStatus(null);
                setShowFeedbackModal(true);
              }}
              className="w-full py-3 flex items-center justify-between text-left hover:opacity-80"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-slate-600" />
                <span className="text-[12.5px] font-medium text-slate-700">
                  Feedback
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {feedbacks.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#738F6D]/15 text-[#496544] text-[10px] font-semibold">
                    {feedbacks.length}
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            </button>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={logoutAccount}
            className="mt-3 w-full py-2.5 rounded-2xl border border-rose-200 bg-rose-50/70 hover:bg-rose-100 text-rose-600 text-[12px] font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      <BottomNavBar activeTab="profile" />

      {/* Monthly Reports Modal */}
      {showReportsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-[330px] bg-white rounded-3xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[14px] font-bold text-slate-800">
                Monthly Financial Report
              </h3>
              <button
                type="button"
                onClick={() => setShowReportsModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-[12px]">
              <div className="bg-[#EEF2ED] rounded-xl p-3 flex justify-between">
                <span className="text-slate-600">Financial Health</span>
                <span className="font-bold text-[#2D6A4F]">
                  {financialHealthScore} / 100
                </span>
              </div>
              <div className="bg-[#EEF2ED] rounded-xl p-3 flex justify-between">
                <span className="text-slate-600">Total Net Worth</span>
                <span className="font-bold text-slate-800">
                  {formatRupiah(totalNetWorth)}
                </span>
              </div>
              <div className="bg-[#EEF2ED] rounded-xl p-3 flex justify-between">
                <span className="text-slate-600">Monthly Cash Flow</span>
                <span className="font-bold text-emerald-700">
                  +{formatRupiah(cashFlowMonthly)}
                </span>
              </div>
              <div className="bg-[#EEF2ED] rounded-xl p-3 flex justify-between">
                <span className="text-slate-600">Monthly Spending</span>
                <span className="font-bold text-rose-600">
                  {formatRupiah(monthlySpendingTotal)}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowReportsModal(false)}
              className="mt-4 w-full py-2.5 rounded-full bg-[#738F6D] text-white text-[12px] font-semibold"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Interactive Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] max-h-[85vh] bg-white rounded-3xl p-5 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#EEF2ED] flex items-center justify-center text-[#5E7858]">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-[14px] font-bold text-slate-800">
                  Send Feedback
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-[11px] text-slate-500 leading-relaxed mb-3">
              Share your experience, suggestions, or report any issues. Your
              feedback is saved directly to the database.
            </p>

            <form onSubmit={handleSubmitFeedback} className="space-y-3">
              {/* Star Rating */}
              <div>
                <div className="text-[10.5px] font-semibold text-slate-600 mb-1.5">
                  Rate your experience
                </div>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 rounded-lg hover:bg-slate-100 transition-colors"
                      aria-label={`Rate ${star} stars`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= feedbackRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Text Input */}
              <div>
                <label
                  htmlFor="user-feedback-textarea"
                  className="block text-[10.5px] font-semibold text-slate-600 mb-1"
                >
                  Your Feedback
                </label>
                <textarea
                  id="user-feedback-textarea"
                  rows={4}
                  value={feedbackText}
                  onChange={(e) => {
                    setFeedbackText(e.target.value);
                    if (feedbackStatus) setFeedbackStatus(null);
                  }}
                  placeholder="Write your feedback or suggestions here..."
                  className="w-full rounded-2xl border border-slate-200 bg-[#F8FAF7] px-3.5 py-2.5 text-[12px] text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#738F6D] resize-none"
                />
              </div>

              {feedbackStatus && (
                <div
                  className={`rounded-xl px-3 py-2 text-[11px] font-medium ${
                    feedbackStatus.type === 'success'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                      : 'bg-rose-50 border border-rose-200 text-rose-600'
                  }`}
                >
                  {feedbackStatus.message}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="flex-1 py-2.5 rounded-full border border-slate-200 text-[12px] font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingFeedback}
                  className="flex-1 py-2.5 rounded-full bg-[#738F6D] hover:bg-[#637E5D] disabled:opacity-60 text-white text-[12px] font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {isSubmittingFeedback ? 'Saving...' : 'Submit'}
                  </span>
                </button>
              </div>
            </form>

            {/* Recent Submitted Feedback List */}
            {feedbacks.length > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-100 overflow-y-auto max-h-36">
                <div className="text-[10.5px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Submitted Feedback ({feedbacks.length})
                </div>
                <div className="space-y-2">
                  {feedbacks.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-xl bg-[#EEF2ED] p-2.5 text-[11px]"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-amber-500">
                          {'★'.repeat(item.rating)}
                          <span className="text-slate-300">
                            {'★'.repeat(Math.max(0, 5 - item.rating))}
                          </span>
                        </span>
                        <span className="text-[9.5px] text-slate-400">
                          {new Date(item.createdAt).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-700 break-words leading-snug">
                        {item.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info Dialog */}
      {activeInfoDialog && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="w-full max-w-[320px] bg-white rounded-3xl p-5 shadow-2xl">
            <h3 className="text-[14px] font-bold text-slate-800">
              {activeInfoDialog.title}
            </h3>
            <p className="text-[12px] text-slate-600 mt-2 leading-relaxed">
              {activeInfoDialog.content}
            </p>
            <button
              type="button"
              onClick={() => setActiveInfoDialog(null)}
              className="mt-4 w-full py-2 rounded-full bg-[#738F6D] text-white text-[12px] font-semibold"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
