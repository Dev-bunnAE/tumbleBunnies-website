import { Loader2 } from 'lucide-react';

type LoadingSpinnerProps = {
  fullScreen?: boolean;
};

export function LoadingSpinner({ fullScreen }: LoadingSpinnerProps) {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
}
