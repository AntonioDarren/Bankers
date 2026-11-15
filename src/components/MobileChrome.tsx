import React from 'react';

export const StatusBar: React.FC<{ darkText?: boolean }> = () => {
  // Reserves the exact height of the native Android / iPhone status bar & camera cutout
  // without rendering fake time/battery icons so the real phone status bar never overlaps content
  return (
    <div
      className="w-full shrink-0 select-none"
      style={{
        height: 'max(env(safe-area-inset-top, 0px), 40px)',
      }}
    />
  );
};

export const GoogleLogo: React.FC = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

/**
 * Cute dark-green sprout mascot from the BANKERS Home Page
 */
export const BankersMascot: React.FC<{ size?: number; className?: string }> = ({
  size = 28,
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    className={`inline-block shrink-0 ${className}`}
  >
    {/* Sprout stem & leaf */}
    <path
      d="M20 11V6"
      stroke="#2D6A4F"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <path
      d="M20 7C20 4 24.5 2.5 27.5 4.5C27.5 7.5 23.5 9 20 7Z"
      fill="#52B788"
    />
    <path
      d="M20 7.5C20 5 16 4 13.5 5.5C13.5 8 17 9 20 7.5Z"
      fill="#40916C"
    />
    {/* Round dark green body */}
    <ellipse cx="20" cy="24.5" rx="13" ry="11.5" fill="#1B4332" />
    <ellipse cx="20" cy="24" rx="12" ry="10.5" fill="#234E3B" />
    {/* Cute glowing yellow eyes */}
    <circle cx="15.5" cy="23.5" r="2" fill="#FDE047" />
    <circle cx="24.5" cy="23.5" r="2" fill="#FDE047" />
    {/* Blush cheeks */}
    <ellipse cx="12.5" cy="25.5" rx="1.6" ry="0.9" fill="#52B788" opacity="0.6" />
    <ellipse cx="27.5" cy="25.5" rx="1.6" ry="0.9" fill="#52B788" opacity="0.6" />
    {/* Tiny happy mouth */}
    <path
      d="M18.2 25.5C19 26.5 21 26.5 21.8 25.5"
      stroke="#FDE047"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * 3D-style Takeaway Coffee Cup with coffee beans from the AI Insight card
 */
export const CoffeeCupIllustration: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg width="56" height="62" viewBox="0 0 64 70" fill="none" className={className}>
    {/* Drop shadow */}
    <ellipse cx="32" cy="64" rx="18" ry="4" fill="#0D1511" opacity="0.5" />
    {/* Cup body (cream/white) */}
    <path
      d="M17 18H47L43.5 59C43.3 61.2 41.5 63 39.3 63H24.7C22.5 63 20.7 61.2 20.5 59L17 18Z"
      fill="#F4F1EA"
    />
    <path
      d="M32 18H47L43.5 59C43.3 61.2 41.5 63 39.3 63H32V18Z"
      fill="#E5DFD3"
    />
    {/* Green coffee sleeve */}
    <path
      d="M18.3 31H45.7L44.4 47H19.6L18.3 31Z"
      fill="#40916C"
    />
    <path
      d="M32 31H45.7L44.4 47H32V31Z"
      fill="#2D6A4F"
    />
    {/* Logo circle on sleeve */}
    <circle cx="32" cy="39" r="4.5" fill="#A7F3D0" opacity="0.85" />
    {/* Cup lid */}
    <rect x="14.5" y="13" width="35" height="5.5" rx="2.5" fill="#FFFFFF" />
    <rect x="17" y="9.5" width="30" height="4" rx="2" fill="#E2E8F0" />
    {/* Floating coffee beans at base */}
    <g transform="translate(8, 52) rotate(-20)">
      <ellipse cx="6" cy="4" rx="5.5" ry="3.6" fill="#78350F" />
      <path d="M2 4C4.5 2.8 7.5 5.2 10 4" stroke="#451A03" strokeWidth="1.2" strokeLinecap="round" />
    </g>
    <g transform="translate(15, 57) rotate(12)">
      <ellipse cx="5" cy="3.5" rx="4.8" ry="3.2" fill="#92400E" />
      <path d="M1.5 3.5C3.5 2.5 6.5 4.5 8.5 3.5" stroke="#451A03" strokeWidth="1.1" strokeLinecap="round" />
    </g>
  </svg>
);

/**
 * Potted Sprout Plant from the bottom-right "Time left / 5 months left" card
 */
export const PottedPlantIllustration: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg width="42" height="48" viewBox="0 0 48 54" fill="none" className={className}>
    <ellipse cx="24" cy="50" rx="12" ry="3" fill="#0D1511" opacity="0.45" />
    {/* Leaves */}
    <path
      d="M24 27V12"
      stroke="#52B788"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M24 16C24 9 33 6 37 10C37 16 30 19 24 16Z"
      fill="#4ADE80"
    />
    <path
      d="M24 20C24 13 15 10 11 14C11 20 18 23 24 20Z"
      fill="#34D399"
    />
    {/* Pot rim */}
    <rect x="13" y="27" width="22" height="5" rx="2" fill="#D97706" />
    {/* Pot body */}
    <path
      d="M15 32H33L30.5 48C30.2 49.4 29 50.5 27.5 50.5H20.5C19 50.5 17.8 49.4 17.5 48L15 32Z"
      fill="#B45309"
    />
  </svg>
);
