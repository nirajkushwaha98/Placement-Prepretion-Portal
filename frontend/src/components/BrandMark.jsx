import React from 'react';

const BrandMark = ({ className = 'w-9 h-9', decorative = true }) => (
  <svg
    viewBox="0 0 40 40"
    fill="none"
    className={className}
    {...(decorative ? { 'aria-hidden': 'true' } : { role: 'img', 'aria-label': 'PlacementPortal crest' })}
  >
    <rect width="40" height="40" rx="10" fill="#16181D" />
    <rect x="1.25" y="1.25" width="37.5" height="37.5" rx="8.75" stroke="#2D323E" strokeWidth="1.5" />
    <path
      d="M11.5 29V11H20.5C24.6421 11 27.5 13.55 27.5 17.25C27.5 20.95 24.6421 23.5 20.5 23.5H15.5V29H11.5ZM15.5 19.75H20.1C22.1 19.75 23.4 18.75 23.4 17.25C23.4 15.75 22.1 14.75 20.1 14.75H15.5V19.75Z"
      fill="#F6F4EF"
    />
    <path d="M23.5 25L29 29H23.5V25Z" fill="#D97706" />
    <circle cx="29.5" cy="12" r="3" fill="#2563EB" />
  </svg>
);

export default BrandMark;

