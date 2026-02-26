import type { LucideIcon } from 'lucide-react';
import { ChevronRight } from 'lucide-react';

interface MyPageRowProps {
  icon: LucideIcon;
  iconBgClassName: string;
  iconColorClassName: string;
  label: string;
  value?: string;
  rightContent?: React.ReactNode;
  onClick?: () => void;
}

export function MyPageRow({
  icon: Icon,
  iconBgClassName,
  iconColorClassName,
  label,
  value,
  rightContent,
  onClick,
}: MyPageRowProps) {
  const content = (
    <div className="flex items-center gap-3">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${iconBgClassName}`}>
        <Icon className={`h-5 w-5 ${iconColorClassName}`} />
      </div>
      <div className="flex flex-1 items-center justify-between">
        <span className="text-sm text-text-primary">{label}</span>
        <div className="flex items-center gap-2">
          {value && (
            <span className="text-xs text-text-tertiary max-w-[180px] truncate">{value}</span>
          )}
          {rightContent}
          {onClick && !rightContent && (
            <ChevronRight className="h-4 w-4 text-text-tertiary icon-chevron-hover" />
          )}
        </div>
      </div>
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className="group w-full p-4 row-interactive text-left"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="p-4">
      {content}
    </div>
  );
}
