import { Loader2 } from 'lucide-react';

export function LoadingState({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 h-full min-h-[300px]">
      <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-4" />
      <p className="text-gray-500">{text}</p>
    </div>
  );
}
