import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFocusTrap } from '@shared/hooks/useFocusTrap';

describe('useFocusTrap', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    // Create container with focusable elements
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    vi.clearAllMocks();
  });

  it('should return a ref object', () => {
    const { result } = renderHook(() => useFocusTrap(false));

    expect(result.current).toBeDefined();
    expect(result.current.current).toBeNull();
  });

  it('should not trap focus when active is false', () => {
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    container.appendChild(button1);
    container.appendChild(button2);

    const { result } = renderHook(() => useFocusTrap(false));

    // Attach ref to container
    act(() => {
      result.current.current = container;
    });

    const keyEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    const preventDefaultSpy = vi.spyOn(keyEvent, 'preventDefault');

    container.dispatchEvent(keyEvent);

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('should focus first element when activated', () => {
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    container.appendChild(button1);
    container.appendChild(button2);

    const focusSpy = vi.spyOn(button1, 'focus');

    // Start with active: false, set ref, then activate
    const { result, rerender } = renderHook(
      ({ active }) => useFocusTrap(active),
      { initialProps: { active: false } }
    );

    act(() => {
      result.current.current = container;
    });

    // Now activate - this should trigger the effect and focus first element
    act(() => {
      rerender({ active: true });
    });

    expect(focusSpy).toHaveBeenCalled();
  });

  it('should trap Tab key forward navigation at last element', () => {
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    const button3 = document.createElement('button');
    container.appendChild(button1);
    container.appendChild(button2);
    container.appendChild(button3);

    const { result, rerender } = renderHook(
      ({ active }) => useFocusTrap(active),
      { initialProps: { active: false } }
    );

    act(() => {
      result.current.current = container;
    });

    act(() => {
      rerender({ active: true });
    });

    // Focus last element
    act(() => {
      button3.focus();
    });

    expect(document.activeElement).toBe(button3);

    // Press Tab
    const keyEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    const preventDefaultSpy = vi.spyOn(keyEvent, 'preventDefault');
    const focusSpy = vi.spyOn(button1, 'focus');

    act(() => {
      container.dispatchEvent(keyEvent);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalled();
  });

  it('should trap Shift+Tab key backward navigation at first element', () => {
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    const button3 = document.createElement('button');
    container.appendChild(button1);
    container.appendChild(button2);
    container.appendChild(button3);

    const { result, rerender } = renderHook(
      ({ active }) => useFocusTrap(active),
      { initialProps: { active: false } }
    );

    act(() => {
      result.current.current = container;
    });

    act(() => {
      rerender({ active: true });
    });

    // Focus first element
    act(() => {
      button1.focus();
    });

    expect(document.activeElement).toBe(button1);

    // Press Shift+Tab
    const keyEvent = new KeyboardEvent('keydown', {
      key: 'Tab',
      shiftKey: true,
      bubbles: true
    });
    const preventDefaultSpy = vi.spyOn(keyEvent, 'preventDefault');
    const focusSpy = vi.spyOn(button3, 'focus');

    act(() => {
      container.dispatchEvent(keyEvent);
    });

    expect(preventDefaultSpy).toHaveBeenCalled();
    expect(focusSpy).toHaveBeenCalled();
  });

  it('should not prevent default for Tab in middle elements', () => {
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    const button3 = document.createElement('button');
    container.appendChild(button1);
    container.appendChild(button2);
    container.appendChild(button3);

    const { result, rerender } = renderHook(
      ({ active }) => useFocusTrap(active),
      { initialProps: { active: false } }
    );

    act(() => {
      result.current.current = container;
    });

    act(() => {
      rerender({ active: true });
    });

    // Focus middle element
    act(() => {
      button2.focus();
    });

    const keyEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    const preventDefaultSpy = vi.spyOn(keyEvent, 'preventDefault');

    act(() => {
      container.dispatchEvent(keyEvent);
    });

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('should handle various focusable elements', () => {
    const link = document.createElement('a');
    link.href = '#';
    const button = document.createElement('button');
    const input = document.createElement('input');
    const textarea = document.createElement('textarea');
    const select = document.createElement('select');
    const div = document.createElement('div');
    div.tabIndex = 0;

    container.appendChild(link);
    container.appendChild(button);
    container.appendChild(input);
    container.appendChild(textarea);
    container.appendChild(select);
    container.appendChild(div);

    const { result, rerender } = renderHook(
      ({ active }) => useFocusTrap(active),
      { initialProps: { active: false } }
    );

    act(() => {
      result.current.current = container;
    });

    act(() => {
      rerender({ active: true });
    });

    // Focus last element
    act(() => {
      div.focus();
    });

    const keyEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    const focusSpy = vi.spyOn(link, 'focus');

    act(() => {
      container.dispatchEvent(keyEvent);
    });

    expect(focusSpy).toHaveBeenCalled();
  });

  it('should ignore disabled elements', () => {
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    button2.disabled = true;
    const button3 = document.createElement('button');

    container.appendChild(button1);
    container.appendChild(button2);
    container.appendChild(button3);

    const { result, rerender } = renderHook(
      ({ active }) => useFocusTrap(active),
      { initialProps: { active: false } }
    );

    act(() => {
      result.current.current = container;
    });

    act(() => {
      rerender({ active: true });
    });

    // Focus last enabled element (button3)
    act(() => {
      button3.focus();
    });

    const keyEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    const focusSpy = vi.spyOn(button1, 'focus');

    act(() => {
      container.dispatchEvent(keyEvent);
    });

    expect(focusSpy).toHaveBeenCalled();
  });

  it('should ignore elements with tabindex="-1"', () => {
    const button1 = document.createElement('button');
    const div = document.createElement('div');
    div.tabIndex = -1;
    const button2 = document.createElement('button');

    container.appendChild(button1);
    container.appendChild(div);
    container.appendChild(button2);

    const { result, rerender } = renderHook(
      ({ active }) => useFocusTrap(active),
      { initialProps: { active: false } }
    );

    act(() => {
      result.current.current = container;
    });

    act(() => {
      rerender({ active: true });
    });

    // Focus last focusable element (button2)
    act(() => {
      button2.focus();
    });

    const keyEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    const focusSpy = vi.spyOn(button1, 'focus');

    act(() => {
      container.dispatchEvent(keyEvent);
    });

    expect(focusSpy).toHaveBeenCalled();
  });

  it('should handle containers with no focusable elements', () => {
    const div = document.createElement('div');
    container.appendChild(div);

    const { result, rerender } = renderHook(
      ({ active }) => useFocusTrap(active),
      { initialProps: { active: false } }
    );

    act(() => {
      result.current.current = container;
    });

    act(() => {
      rerender({ active: true });
    });

    const keyEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
    const preventDefaultSpy = vi.spyOn(keyEvent, 'preventDefault');

    act(() => {
      container.dispatchEvent(keyEvent);
    });

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('should ignore non-Tab keys', () => {
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    container.appendChild(button1);
    container.appendChild(button2);

    const { result, rerender } = renderHook(
      ({ active }) => useFocusTrap(active),
      { initialProps: { active: false } }
    );

    act(() => {
      result.current.current = container;
    });

    act(() => {
      rerender({ active: true });
    });

    act(() => {
      button1.focus();
    });

    const keyEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
    const preventDefaultSpy = vi.spyOn(keyEvent, 'preventDefault');

    act(() => {
      container.dispatchEvent(keyEvent);
    });

    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });

  it('should cleanup event listener when deactivated', () => {
    const button1 = document.createElement('button');
    container.appendChild(button1);

    const removeEventListenerSpy = vi.spyOn(container, 'removeEventListener');

    const { result, rerender } = renderHook(
      ({ active }) => useFocusTrap(active),
      { initialProps: { active: false } }
    );

    act(() => {
      result.current.current = container;
    });

    act(() => {
      rerender({ active: true });
    });

    // Clear previous calls
    removeEventListenerSpy.mockClear();

    // Deactivate
    act(() => {
      rerender({ active: false });
    });

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });

  it('should cleanup event listener on unmount', () => {
    const button1 = document.createElement('button');
    container.appendChild(button1);

    const { result, rerender, unmount } = renderHook(
      ({ active }) => useFocusTrap(active),
      { initialProps: { active: false } }
    );

    act(() => {
      result.current.current = container;
    });

    act(() => {
      rerender({ active: true });
    });

    const removeEventListenerSpy = vi.spyOn(container, 'removeEventListener');

    act(() => {
      unmount();
    });

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
  });
});
