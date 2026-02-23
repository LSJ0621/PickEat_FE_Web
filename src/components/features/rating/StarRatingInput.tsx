/**
 * StarRatingInput 컴포넌트
 * 별점 입력을 위한 인터랙티브 컴포넌트
 */

import { useState } from 'react';

interface StarRatingInputProps {
  rating: number;
  onRatingChange: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

const STAR_SIZES = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

export function StarRatingInput({
  rating,
  onRatingChange,
  size = 'md',
}: StarRatingInputProps) {
  const [hoverRating, setHoverRating] = useState<number>(0);

  const displayRating = hoverRating || rating;

  return (
    <div
      className="flex items-center justify-center gap-2"
      role="group"
      aria-label="별점 선택"
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isSelected = star <= displayRating;

        return (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className={`${STAR_SIZES[size]} rounded transition-transform duration-150 hover:scale-110 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface`}
            aria-label={`${star}점`}
            aria-pressed={star === rating}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill={isSelected ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`${isSelected ? 'text-yellow-400 drop-shadow-sm' : 'text-text-tertiary'} transition-colors duration-150 w-full h-full`}
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
