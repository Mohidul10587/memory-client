import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function LoadingSpinner({ text = 'লোড হচ্ছে...', size = 'md' }: LoadingSpinnerProps) {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8">
      <Loader2 className={`${sizes[size]} animate-spin text-blue-600`} />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );
}
