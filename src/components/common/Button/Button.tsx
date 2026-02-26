/**
 * 공통 Button 컴포넌트 예시
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  ...props
}) => {
  const { t } = useTranslation();
  const baseClasses =
    'inline-flex items-center justify-center font-semibold rounded-2xl tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-60 disabled:cursor-not-allowed'

  const variantClasses = {
    primary:
      'text-text-inverse bg-gradient-to-r from-brand-primary to-brand-amber shadow-[0_10px_40px_rgba(255,107,53,0.35)] hover:shadow-[0_15px_45px_rgba(255,107,53,0.45)] hover:-translate-y-0.5 focus-visible:ring-orange-300',
    secondary:
      'text-text-primary bg-bg-secondary shadow-xl shadow-black/10 hover:bg-bg-tertiary focus-visible:ring-border-focus',
    ghost:
      'text-text-secondary border border-border-default bg-brand-primary/5 hover:bg-bg-hover focus-visible:ring-border-focus',
    outline:
      'border border-border-default text-text-primary bg-bg-surface hover:bg-bg-secondary active:bg-bg-tertiary focus-visible:ring-border-focus',
  }

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-2.5 text-base',
    lg: 'px-8 py-3 text-lg',
  }

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? t('common.loading') : children}
    </button>
  )
}
