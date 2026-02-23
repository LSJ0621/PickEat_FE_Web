# CalendarDatePicker Component

Traditional calendar date picker with month/year navigation and dark theme styling.

## Features

- **Traditional Calendar UI**: 7x6 grid with month/year navigation
- **English Localization**: English month names and weekday headers
- **Date Highlighting**:
  - Today's date with orange border
  - Selected date with orange gradient background
- **Date Range Support**: Optional min/max date constraints
- **Dark Theme**: Slate-900 background with orange-500 accent colors
- **Responsive Design**: Mobile-friendly bottom sheet modal
- **Keyboard Navigation**: Press Escape to close
- **Accessibility**: ARIA labels and keyboard support

## File Structure

```
CalendarDatePicker/
├── index.tsx           # Main modal component
├── CalendarHeader.tsx  # Month/year navigation header
├── CalendarGrid.tsx    # 7x6 calendar grid with date cells
├── types.ts            # TypeScript type definitions
└── README.md           # This file
```

## Usage

### Basic Example

```typescript
import { useState } from 'react';
import { CalendarDatePicker } from '@/components/common/CalendarDatePicker';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        Select Date
      </button>

      <CalendarDatePicker
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        selectedDate={selectedDate}
        onDateSelect={(date) => {
          setSelectedDate(date);
          console.log('Selected:', date);
        }}
      />
    </div>
  );
}
```

### With Date Range Constraints

```typescript
<CalendarDatePicker
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  selectedDate={selectedDate}
  onDateSelect={setSelectedDate}
  minDate={new Date('2020-01-01')}
  maxDate={new Date()}
/>
```

### Integration with DateInput

```typescript
import { useState } from 'react';
import { CalendarDatePicker } from '@/components/common/CalendarDatePicker';
import { DateInput } from '@/components/common/DateInput';

function DateSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [date, setDate] = useState(new Date());

  return (
    <>
      <DateInput
        value={date}
        onChange={setDate}
        onClick={() => setIsOpen(true)}
        label="Select Date"
      />

      <CalendarDatePicker
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        selectedDate={date}
        onDateSelect={setDate}
      />
    </>
  );
}
```

## Props Interface

### CalendarDatePicker

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `isOpen` | `boolean` | Yes | Whether the modal is open |
| `onClose` | `() => void` | Yes | Callback when modal is closed |
| `selectedDate` | `Date` | Yes | Currently selected date |
| `onDateSelect` | `(date: Date) => void` | Yes | Callback when date is selected |
| `minDate` | `Date` | No | Minimum selectable date |
| `maxDate` | `Date` | No | Maximum selectable date |

## Styling

### Color Scheme

- **Background**: `bg-slate-900/95` with backdrop blur
- **Accent Color**: Orange-500 to Rose-500 gradient
- **Text**: White for current month, slate-500 for other months
- **Today**: Orange-500 border
- **Selected**: Orange-500 to Rose-500 gradient background
- **Disabled**: Slate-600 with reduced opacity

### Tailwind Classes

Component uses Tailwind CSS exclusively. Key classes:
- `bg-slate-900/95` - Modal background
- `from-orange-400 to-rose-400` - Header gradient
- `from-orange-500 to-rose-500` - Selected date
- `border-orange-500/50` - Today's border

## Accessibility

### Keyboard Navigation

- **Escape**: Close modal
- **Tab**: Navigate between interactive elements
- **Enter/Space**: Select date cell

### ARIA Attributes

- Navigation buttons have `aria-label` attributes
- Disabled states properly marked
- Semantic HTML structure

### Touch Targets

All interactive elements have minimum 44px touch target (WCAG 2.1 AA).

## Performance Optimizations

1. **useMemo**: Calendar day cells are memoized to prevent recalculation
2. **Portal Rendering**: Uses React Portal for modal overlay
3. **Animation Hooks**: Reuses `useModalAnimation` and `useModalScrollLock`
4. **Minimal Re-renders**: State updates optimized to prevent unnecessary renders

## Comparison with ScrollDatePicker

| Feature | CalendarDatePicker | ScrollDatePicker |
|---------|-------------------|------------------|
| UI Style | Traditional calendar grid | Scroll wheels |
| Month Navigation | Previous/Next buttons | Scroll wheel |
| Visual Date Context | Full month visible | Single date visible |
| Best For | Desktop/tablet users | Mobile users |
| Touch Interaction | Tap date cells | Scroll to select |

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Requires JavaScript enabled
- CSS Grid support required

## Dependencies

- React 19
- Tailwind CSS
- Custom hooks from `@/hooks/common/`:
  - `useModalAnimation`
  - `useModalScrollLock`

## Testing Checklist

- [ ] Opens and closes correctly
- [ ] Today's date is highlighted
- [ ] Selected date shows orange gradient
- [ ] Previous/next month navigation works
- [ ] Min/max date constraints are enforced
- [ ] Disabled dates are not clickable
- [ ] Clicking outside closes modal
- [ ] Escape key closes modal
- [ ] "Today" button navigates to current month
- [ ] Previous/next month days are clickable
- [ ] Mobile responsive (bottom sheet)
- [ ] Keyboard navigation works
