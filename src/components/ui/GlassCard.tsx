import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'accent';
  glow?: boolean;
  hoverLift?: boolean;
  className?: string;
  onClick?: () => void;
}

const variantStyles = {
  default: 'glass-card',
  elevated: 'glass-card-premium',
  accent: 'glass-card border-brand/25',
};

const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = 'default',
  glow = false,
  hoverLift = false,
  className,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-[20px] border transition-all duration-200',
        variantStyles[variant],
        glow && 'shadow-[0_0_32px_var(--brand-glow)]',
        hoverLift && 'hover:-translate-y-0.5 hover:border-brand/30',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </div>
  );
};

export default GlassCard;
