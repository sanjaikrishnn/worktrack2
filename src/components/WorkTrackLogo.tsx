import React from 'react';

interface WorkTrackLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'horizontal' | 'stacked' | 'icon-only';
  theme?: 'light' | 'dark' | 'brand';
}

export const WorkTrackLogo: React.FC<WorkTrackLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'horizontal',
  theme = 'brand',
}) => {
  // Color configuration
  const color =
    theme === 'dark' ? '#FFFFFF' : theme === 'brand' ? '#2563EB' : '#12345A';
  const textColor =
    theme === 'dark' ? '#FFFFFF' : theme === 'brand' ? '#12345A' : '#172033';

  // Dimension scaling
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-11 h-11',
    xl: 'w-16 h-16',
  };

  const textSizes = {
    sm: 'text-base font-black tracking-tight',
    md: 'text-xl font-black tracking-tight',
    lg: 'text-2xl font-black tracking-tight',
    xl: 'text-4xl font-black tracking-tight',
  };

  // The distinctive "WT" mark with circular rework arrow (Image 2)
  const LogoIcon = (
    <svg
      viewBox="0 0 100 80"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={`${iconSizes[size]} shrink-0`}
      style={{ color }}
      aria-hidden="true"
    >
      {/* Letter 'W' left part */}
      <polygon points="12,24 22,24 33,52 44,24 53,24 39,60 27,60" />
      <polygon points="26,60 14,24 4,24 18,60" />

      {/* Letter 'T' horizontal bar and stem */}
      <polygon points="32,18 72,18 72,26 57,26 57,60 47,60 47,26 32,26" />

      {/* Rework circular loop arrow from right of T curving back */}
      <path
        d="M 68,22 C 82,22 88,32 88,42 C 88,54 80,63 68,64 L 68,56 C 75,55 80,49 80,42 C 80,35 75,29 68,29 Z"
      />
      {/* Arrowhead pointing bottom-left */}
      <polygon points="61,64 73,55 73,73" />
    </svg>
  );

  if (variant === 'icon-only') {
    return <div className={`inline-flex items-center justify-center ${className}`}>{LogoIcon}</div>;
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        {LogoIcon}
        <span className={`${textSizes[size]}`} style={{ color: textColor }}>
          WorkTrack
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {LogoIcon}
      <span className={`${textSizes[size]}`} style={{ color: textColor }}>
        Work<span className="text-[#2563EB]">Track</span>
      </span>
    </div>
  );
};
