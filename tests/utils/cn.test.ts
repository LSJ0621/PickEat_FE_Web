import { describe, it, expect } from 'vitest';
import { cn } from '@/utils/cn';

describe('cn', () => {
  it('should merge single class name', () => {
    const result = cn('text-red-500');
    expect(result).toBe('text-red-500');
  });

  it('should merge multiple class names', () => {
    const result = cn('text-red-500', 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle conditional classes with object syntax', () => {
    const result = cn({
      'text-red-500': true,
      'bg-blue-500': false,
      'p-4': true,
    });
    expect(result).toBe('text-red-500 p-4');
  });

  it('should handle array of class names', () => {
    const result = cn(['text-red-500', 'bg-blue-500', 'p-4']);
    expect(result).toBe('text-red-500 bg-blue-500 p-4');
  });

  it('should merge Tailwind conflicting classes correctly', () => {
    // twMerge should keep the last conflicting class
    const result = cn('px-2', 'px-4');
    expect(result).toBe('px-4');
  });

  it('should merge Tailwind conflicting classes with multiple properties', () => {
    const result = cn('p-2', 'px-4');
    expect(result).toBe('p-2 px-4');
  });

  it('should handle empty strings', () => {
    const result = cn('', 'text-red-500', '');
    expect(result).toBe('text-red-500');
  });

  it('should handle null and undefined values', () => {
    const result = cn('text-red-500', null, undefined, 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle false and 0 values', () => {
    const result = cn('text-red-500', false, 0, 'bg-blue-500');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle mixed input types', () => {
    const result = cn(
      'text-red-500',
      { 'bg-blue-500': true, hidden: false },
      ['p-4', 'm-2'],
      undefined,
      'border'
    );
    expect(result).toContain('text-red-500');
    expect(result).toContain('bg-blue-500');
    expect(result).toContain('p-4');
    expect(result).toContain('m-2');
    expect(result).toContain('border');
    expect(result).not.toContain('hidden');
  });

  it('should merge complex Tailwind classes', () => {
    const result = cn('bg-red-500 text-white', 'bg-blue-500 p-4');
    // bg-blue-500 should override bg-red-500
    expect(result).toBe('text-white bg-blue-500 p-4');
  });

  it('should handle responsive Tailwind classes', () => {
    const result = cn('text-sm md:text-base', 'lg:text-lg');
    expect(result).toBe('text-sm md:text-base lg:text-lg');
  });

  it('should handle hover and state modifiers', () => {
    const result = cn('hover:bg-red-500', 'hover:bg-blue-500');
    // Last hover class should win
    expect(result).toBe('hover:bg-blue-500');
  });

  it('should handle dark mode classes', () => {
    const result = cn('bg-white dark:bg-black', 'text-black dark:text-white');
    expect(result).toContain('bg-white');
    expect(result).toContain('dark:bg-black');
    expect(result).toContain('text-black');
    expect(result).toContain('dark:text-white');
  });

  it('should return empty string when no arguments', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle whitespace in class strings', () => {
    const result = cn('  text-red-500  ', '  bg-blue-500  ');
    expect(result).toBe('text-red-500 bg-blue-500');
  });

  it('should handle complex conditional logic', () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn(
      'base-class',
      isActive && 'active-class',
      isDisabled && 'disabled-class',
      !isDisabled && 'enabled-class'
    );
    expect(result).toContain('base-class');
    expect(result).toContain('active-class');
    expect(result).toContain('enabled-class');
    expect(result).not.toContain('disabled-class');
  });

  it('should merge arbitrary values in Tailwind', () => {
    const result = cn('top-[10px]', 'top-[20px]');
    // Last arbitrary value should win
    expect(result).toBe('top-[20px]');
  });

  it('should handle important modifier', () => {
    const result = cn('!text-red-500', 'text-blue-500');
    expect(result).toContain('!text-red-500');
  });
});
