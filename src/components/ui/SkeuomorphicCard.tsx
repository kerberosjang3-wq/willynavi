import { ReactNode } from 'react';
import clsx from 'clsx';

interface SkeuomorphicCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'dark' | 'darker';
}

export function SkeuomorphicCard({
  children,
  className,
  variant = 'dark',
}: SkeuomorphicCardProps) {
  return (
    <div
      className={clsx('rounded-2xl p-3 shadow-2xl', className)}
      style={{
        background:
          variant === 'darker'
            ? 'linear-gradient(145deg, #0f0f14, #0a0a0e)'
            : 'linear-gradient(145deg, #1a1a24, #12121a)',
        border: '1px solid #2e2e3e',
        boxShadow:
          '0 8px 32px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.4)',
      }}
    >
      {children}
    </div>
  );
}
