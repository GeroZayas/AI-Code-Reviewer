
import React from 'react';

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    <path d="M18 9h.01" />
    <path d="M21 12h.01" />
    <path d="M12 21h.01" />
    <path d="M9 18h.01" />
    <path d="m3 9 3 3" />
    <path d="m3 15 3-3" />
  </svg>
);
