import React from 'react';

interface DoodleProps {
  className?: string;
  color?: string;
}

// Hand-drawn botanical doodle set inspired by the One Year aesthetic
export const DoodleTree: React.FC<DoodleProps> = ({ className = 'w-5 h-5', color = 'currentColor' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22v-8" />
    <path d="M12 14c-3-2-5-5-5-8 0-3 2-4 5-4s5 1 5 4c0 3-2 6-5 8z" />
    <path d="M10 17l-3-2" />
    <path d="M14 16l3-2" />
    <path d="M8 8c1-1 3-1 4 0" />
  </svg>
);

export const DoodleFlower: React.FC<DoodleProps> = ({ className = 'w-5 h-5', color = 'currentColor' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="2.5" />
    <path d="M12 2.5c-1 0-1.8 1-1.8 2 0 1 .8 1.5 1.8 1.5s1.8-.5 1.8-1.5c0-1-.8-2-1.8-2z" />
    <path d="M17.5 8c0-1-1-1.8-2-1.8-1 0-1.5.8-1.5 1.8s.5 1.8 1.5 1.8c1 0 2-.8 2-1.8z" />
    <path d="M12 13.5c1 0 1.8-1 1.8-2 0-1-.8-1.5-1.8-1.5s-1.8.5-1.8 1.5c0 1 .8 2 1.8 2z" />
    <path d="M6.5 8c0 1 1 1.8 2 1.8 1 0 1.5-.8 1.5-1.8s-.5-1.8-1.5-1.8c-1 0-2 .8-2 1.8z" />
    <path d="M12 10.5v11.5" />
    <path d="M12 16c2-1 3-1 4 0" />
    <path d="M12 18c-2-1-3-1-4 0" />
  </svg>
);

export const DoodleSprout: React.FC<DoodleProps> = ({ className = 'w-5 h-5', color = 'currentColor' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 21v-9" />
    <path d="M12 12c-4 0-7-2.5-7-6 4 0 7 2.5 7 6z" />
    <path d="M12 14c4 0 7-2.5 7-6-4 0-7 2.5-7 6z" />
    <path d="M9 21h6" />
  </svg>
);

export const DoodleMushroom: React.FC<DoodleProps> = ({ className = 'w-5 h-5', color = 'currentColor' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 13c0-5 3.5-9 8-9s8 4 8 9H4z" />
    <path d="M10 13v7c0 .5.5 1 1 1h2c.5 0 1-.5 1-1v-7" />
    <circle cx="8" cy="8.5" r="1" />
    <circle cx="14" cy="7.5" r="1" />
    <circle cx="16" cy="10.5" r="1" />
  </svg>
);

export const DoodleCherries: React.FC<DoodleProps> = ({ className = 'w-5 h-5', color = 'currentColor' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="7" cy="17" r="3.5" />
    <circle cx="17" cy="16" r="3.5" />
    <path d="M7 13.5c1.5-4 5-8 10-10" />
    <path d="M17 12.5c-1-3.5-3.5-7-7-9" />
    <path d="M15 3.5c2 0 4 .5 5 2" />
  </svg>
);

export const DoodleWateringCan: React.FC<DoodleProps> = ({ className = 'w-5 h-5', color = 'currentColor' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="7" y="10" width="10" height="9" rx="2" />
    <path d="M7 13H4a1 1 0 0 1-1-1v-1a1 1 0 0 1 1-1h3" />
    <path d="M17 13l4-2v2l-4 2" />
    <path d="M9 10V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
  </svg>
);

export const DoodleNotePaper: React.FC<DoodleProps> = ({ className = 'w-5 h-5', color = 'currentColor' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6" />
    <path d="M9 17h4" />
  </svg>
);

export const DOODLE_LIST = [
  DoodleFlower,
  DoodleTree,
  DoodleSprout,
  DoodleMushroom,
  DoodleCherries,
];

export const getRandomDoodle = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % DOODLE_LIST.length;
  return DOODLE_LIST[index];
};
