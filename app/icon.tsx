import { ImageResponse } from 'next/og';

export const size = { width: 48, height: 48 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 48 48"
          width="36"
          height="36"
          fill="none"
        >
          <polygon points="24,8 40,16 24,24 8,16" fill="white" opacity="0.95" />
          <rect x="22.5" y="23" width="3" height="8" rx="1.5" fill="white" opacity="0.85" />
          <path
            d="M13 18v6c0 2.5 4.9 5 11 5s11-2.5 11-5v-6"
            stroke="white"
            strokeWidth="2.2"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
          <circle cx="37" cy="17" r="2" fill="white" opacity="0.7" />
          <line x1="37" y1="19" x2="37" y2="25" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
          <line x1="37" y1="25" x2="34" y2="29" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
