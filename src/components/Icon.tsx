/** Thin line icons, drawn on a 24px grid and stroked with currentColor. */
const paths = {
  book: (
    <>
      <path d="M3 5.5c2.8-1 5.8-1 9 1v13c-3.2-2-6.2-2-9-1z" />
      <path d="M21 5.5c-2.8-1-5.8-1-9 1v13c3.2-2 6.2-2 9-1z" />
    </>
  ),
  diamond: (
    <>
      <path d="M6.5 4h11L21 9l-9 11L3 9z" />
      <path d="M3 9h18M9.5 4 8 9l4 11 4-11-1.5-5" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
    </>
  ),
  flower: (
    <>
      <circle cx="12" cy="10" r="2.2" />
      <path d="M12 7.8c-1.6-3.2 1.6-4.6 0-5.8M12 7.8c1.6-3.2-1.6-4.6 0-5.8" />
      <path d="M9.8 10c-3.4-.8-4.8 2.2-6.3 1M14.2 10c3.4-.8 4.8 2.2 6.3 1" />
      <path d="M10.5 11.8c-2 2.8-.2 5.2-1.6 6.4M13.5 11.8c2 2.8.2 5.2 1.6 6.4" />
      <path d="M12 12.2V22" />
    </>
  ),
  ring: (
    <>
      <circle cx="12" cy="14.5" r="6.5" />
      <path d="m9.5 5 1-2h3l1 2-2.5 3z" />
    </>
  ),
  megaphone: (
    <>
      <path d="M3 10v4h3l8 5V5L6 10z" />
      <path d="M17.5 9a4 4 0 0 1 0 6M7 14l1.5 6h2.5L10 15" />
    </>
  ),
  reel: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="3" />
      <path d="M3 8.5h18M8 4l2 4.5M14 4l2 4.5" />
      <path d="m10.5 12 4 2.25-4 2.25z" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 5 5" />
    </>
  ),
  heart: <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20z" />,
  palette: (
    <>
      <path d="M12 3a9 9 0 0 0 0 18c1.4 0 2-.9 2-1.8 0-1.4-1.3-1.6-1.3-2.9 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.6 17 3 12 3z" />
      <circle cx="7.5" cy="11" r="1" />
      <circle cx="10" cy="7" r="1" />
      <circle cx="15" cy="7.5" r="1" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20h16" />
      <path d="M6 20v-5M10 20v-8M14 20v-6M18 20V8" />
      <path d="m5 11 5-4 4 3 5-5M16 5h3v3" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  users: (
    <>
      <circle cx="12" cy="8" r="3" />
      <path d="M6.5 19a5.5 5.5 0 0 1 11 0" />
      <circle cx="5" cy="10" r="2" />
      <circle cx="19" cy="10" r="2" />
      <path d="M2 18a3.5 3.5 0 0 1 4-3.4M22 18a3.5 3.5 0 0 0-4-3.4" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="m4 7 8 6 8-6" />
    </>
  ),
  phone: (
    <path d="M6.6 3.5 9 3l1.6 4.2-2.1 1.4a11 11 0 0 0 6.9 6.9l1.4-2.1L21 15l-.5 2.4A2.4 2.4 0 0 1 18.2 19 15.2 15.2 0 0 1 5 5.8a2.4 2.4 0 0 1 1.6-2.3z" />
  ),
  chat: (
    <>
      <path d="M4 19.5 5.3 16A8 8 0 1 1 8 18.7z" />
      <path d="M9 10.5h6M9 13.5h4" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  sparkle: <path d="M12 3c.6 4.6 2.4 6.4 7 7-4.6.6-6.4 2.4-7 7-.6-4.6-2.4-6.4-7-7 4.6-.6 6.4-2.4 7-7z" />,
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  cap: (
    <>
      <path d="m2 9 10-5 10 5-10 5z" />
      <path d="M6 11v5c3.5 2.5 8.5 2.5 12 0v-5M22 9v6" />
    </>
  ),
}

export type IconName = keyof typeof paths

function Icon({ name, className }: { name: IconName; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

export default Icon
