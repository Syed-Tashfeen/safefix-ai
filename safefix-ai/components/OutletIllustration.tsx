export function OutletIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 320 320"
      className={className}
      role="img"
      aria-label="Illustration of an electrical socket with burn marks and a cracked faceplate"
    >
      <defs>
        <radialGradient id="burn" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#1a0f0a" stopOpacity="0.95" />
          <stop offset="0.6" stopColor="#3b2412" stopOpacity="0.6" />
          <stop offset="1" stopColor="#3b2412" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect x="40" y="40" width="240" height="240" rx="36" fill="#E8EDF6" />
      <rect x="52" y="52" width="216" height="216" rx="28" fill="#F6F8FC" stroke="#C9D3E6" />
      <circle cx="160" cy="78" r="6" fill="#B9C5DD" />
      <circle cx="160" cy="242" r="6" fill="#B9C5DD" />
      <circle cx="160" cy="160" r="82" fill="#DCE3F0" stroke="#B9C5DD" strokeWidth="3" />
      <rect x="128" y="126" width="11" height="36" rx="3" fill="#2B3550" />
      <rect x="181" y="126" width="11" height="36" rx="3" fill="#2B3550" />
      <path d="M149 190a11 11 0 0 1 22 0z" fill="#2B3550" />
      <ellipse cx="190" cy="205" rx="64" ry="46" fill="url(#burn)" />
      <ellipse cx="124" cy="116" rx="30" ry="22" fill="url(#burn)" opacity="0.65" />
      <path
        d="M214 148l-14 16 10 8-16 18"
        fill="none"
        stroke="#2B1A12"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
