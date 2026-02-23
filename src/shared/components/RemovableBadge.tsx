import { X } from "lucide-react";
import { Badge, type BadgeProps } from "@shared/ui/badge";

interface RemovableBadgeProps extends BadgeProps {
  label: string;
  onRemove: () => void;
  removeAriaLabel?: string;
}

export function RemovableBadge({
  label,
  onRemove,
  removeAriaLabel,
  className,
  ...props
}: RemovableBadgeProps) {
  return (
    <Badge className={className} {...props}>
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 rounded-full hover:bg-black/10 p-0.5"
        aria-label={removeAriaLabel ?? `${label} 삭제`}
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}
