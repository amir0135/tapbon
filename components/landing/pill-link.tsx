import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const variants = {
  'solid-ink': 'bg-ink text-paper hover:bg-ink/90',
  'solid-mint': 'bg-mint text-ink hover:bg-mint/90 font-semibold',
  'outline-ink': 'border border-ink/25 text-ink hover:border-ink hover:bg-ink/5',
  'outline-paper':
    'border border-paper/30 text-paper hover:border-paper hover:bg-paper/10'
} as const;

export type PillVariant = keyof typeof variants;

export function PillLink({
  href,
  variant = 'solid-ink',
  arrow = false,
  className,
  children
}: {
  href: string;
  variant?: PillVariant;
  arrow?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex h-12 items-center justify-center gap-2 rounded-full px-[22px] text-[14.5px] font-semibold tracking-[0.01em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint',
        variants[variant],
        className
      )}
    >
      {children}
      {arrow && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
    </Link>
  );
}
