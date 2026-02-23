import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Button } from '@shared/components/Button';

interface EmptyStateProps {
  /** lucide-react icon component or any ReactNode */
  icon: LucideIcon | ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({ icon, title, description, action, className = '' }: EmptyStateProps) {
  const isLucideIcon = typeof icon === 'function';

  return (
    <div className={`flex flex-col items-center px-8 py-16 text-center ${className}`}>
      <div className="mb-4 text-text-tertiary animate-fade-in-up animate-float">
        {isLucideIcon ? (() => {
          const Icon = icon as LucideIcon;
          return <Icon className="h-12 w-12" aria-hidden="true" />;
        })() : icon}
      </div>
      <h3 className="text-xl font-semibold text-text-primary animate-fade-in-up">
        {title}
      </h3>
      {description && (
        <p className="mt-2 text-sm text-text-tertiary animate-fade-in-up-delay">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-6 animate-fade-in-up-delay-2">
          <Button variant="primary" size="md" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
