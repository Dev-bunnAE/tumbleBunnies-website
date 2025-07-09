
type LoadingSpinnerProps = {
  fullScreen?: boolean;
};

const BunnyIcon = ({ className = "" }) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <ellipse cx="32" cy="48" rx="18" ry="10" fill="#fff" stroke="#a78bfa" strokeWidth="2" />
    <ellipse cx="22" cy="20" rx="6" ry="16" fill="#fff" stroke="#a78bfa" strokeWidth="2" />
    <ellipse cx="42" cy="20" rx="6" ry="16" fill="#fff" stroke="#a78bfa" strokeWidth="2" />
    <ellipse cx="32" cy="38" rx="12" ry="10" fill="#fff" stroke="#a78bfa" strokeWidth="2" />
    <circle cx="26" cy="38" r="2" fill="#a78bfa" />
    <circle cx="38" cy="38" r="2" fill="#a78bfa" />
    <ellipse cx="32" cy="44" rx="3" ry="1.5" fill="#a78bfa" />
  </svg>
);

export function LoadingSpinner({ fullScreen }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <BunnyIcon className="h-24 w-24 animate-pulse" />
      </div>
    );
  }

  return <BunnyIcon className="h-10 w-10 animate-pulse" />;
}
