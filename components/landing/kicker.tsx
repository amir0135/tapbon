import { cn } from '@/lib/utils';

export function Kicker({
  children,
  onDark = false,
  className
}: {
  children: React.ReactNode;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <p
      className={cn(
        'font-mono text-[13px] font-semibold uppercase tracking-[0.14em]',
        onDark ? 'text-mint' : 'text-mint',
        className
      )}
    >
      {children}
    </p>
  );
}
