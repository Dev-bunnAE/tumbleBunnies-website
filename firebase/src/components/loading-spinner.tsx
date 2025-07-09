import { Rabbit } from 'lucide-react';

type LoadingSpinnerProps = {
  fullScreen?: boolean;
};

const BunnyIcon = ({ className = "" }) => (
    <Rabbit className={className} />
);

export function LoadingSpinner({ fullScreen }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <BunnyIcon className="h-24 w-24 text-primary animate-pulse" />
      </div>
    );
  }

  return <BunnyIcon className="h-10 w-10 text-primary animate-pulse" />;
}
