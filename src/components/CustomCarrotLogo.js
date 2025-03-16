import React from 'react';

const CustomCarrotLogo = ({ size = 32 }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Carrot body - traditional conical shape */}
      <path
        d="M16 8C18 8 20 9 21 11C24 16 24 30 16 38C8 30 8 16 11 11C12 9 14 8 16 8Z"
        fill="#ff6b00"
        stroke="#e65100"
        strokeWidth="1"
      />
      
      {/* Carrot texture lines */}
      <path
        d="M13 12C13 12 15 20 16 28M19 12C19 12 17 20 16 28"
        stroke="#e65100"
        strokeWidth="1"
        opacity="0.5"
      />
      
      {/* Green tops - more natural looking */}
      <path
        d="M14 4C14 4 15 8 16 8C17 8 18 4 18 4"
        stroke="#2e7d32"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 6C12 6 14 9 16 8C18 7 20 6 20 6"
        stroke="#2e7d32"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M16 3C16 3 17 7 16 8C15 7 16 3 16 3"
        stroke="#2e7d32"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Face */}
      <circle cx="14" cy="14" r="1" fill="#000000" /> {/* Left eye */}
      <circle cx="18" cy="14" r="1" fill="#000000" /> {/* Right eye */}
      <path
        d="M14 17C14 17 16 18 18 17"
        stroke="#000000"
        strokeWidth="1"
        strokeLinecap="round"
      /> {/* Smile */}
    </svg>
  );
};

export default CustomCarrotLogo; 