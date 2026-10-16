import React from 'react';

interface WorkTrackLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'horizontal' | 'stacked' | 'icon-only';
  theme?: 'light' | 'dark' | 'brand' | 'sandal';
}

export const WorkTrackLogo: React.FC<WorkTrackLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'horizontal',
  theme = 'brand',
}) => {
  // Brand colors: Green #2E6B50 and Sandal #DCC7A1
  const greenColor = '#2E6B50';
  const sandalColor = '#DCC7A1';
  const darkSandal = '#C6B086';

  const strokeColor =
    theme === 'dark' ? sandalColor : theme === 'sandal' ? greenColor : greenColor;
  const fillColor =
    theme === 'dark' ? '#163A2B' : theme === 'sandal' ? '#FAF6EF' : '#FAF6EF';
  const symbolColor =
    theme === 'dark' ? sandalColor : theme === 'sandal' ? greenColor : greenColor;
  const textColor =
    theme === 'dark' ? '#FAF6EF' : theme === 'sandal' ? '#172033' : '#172033';

  // Dimension scaling
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-20 h-20',
  };

  const textSizes = {
    sm: 'text-base font-black tracking-tight',
    md: 'text-xl font-black tracking-tight',
    lg: 'text-2xl font-black tracking-tight',
    xl: 'text-4xl font-black tracking-tight',
  };

  // Exact circular WorkTrack emblem with WT monogram and circular rework loop arrow (as uploaded in image 1)
  const LogoIcon = (
    <svg
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
      className={`${iconSizes[size]} shrink-0 drop-shadow-xs`}
      aria-hidden="true"
    >
      {/* Outer circular badge */}
      <circle
        cx="100"
        cy="100"
        r="93"
        stroke={strokeColor}
        strokeWidth="7"
        fill={fillColor}
      />

      <g fill={symbolColor}>
        {/* Leftmost slant of W */}
        <polygon points="23,76 45,76 60,112 40,112" />
        <polygon points="23,76 49,133 70,133 46,76" />

        {/* Center apex and right slant of W */}
        <polygon points="49,133 76,88 95,88 68,133" />
        <polygon points="76,88 95,133 115,133 96,88" />

        {/* T horizontal top bar */}
        <polygon points="63,63 146,63 139,78 68,78" />

        {/* T vertical central stem */}
        <polygon points="97,78 115,78 115,133 97,133" />

        {/* Clockwise rework loop arc */}
        <path d="M 140,63 C 163,66 177,83 177,105 C 177,124 163,140 142,143 L 142,126 C 153,124 161,115 161,105 C 161,92 152,80 139,78 Z" />

        {/* Arrowhead pointing counter-clockwise / back to the rework loop */}
        <polygon points="120,125 142,105 142,145" />
      </g>
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
          Work<span style={{ color: greenColor }}>Track</span>
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {LogoIcon}
      <span className={`${textSizes[size]}`} style={{ color: textColor }}>
        Work<span style={{ color: greenColor }}>Track</span>
      </span>
    </div>
  );
};
