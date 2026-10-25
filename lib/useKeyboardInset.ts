import { useCallback, useEffect, useRef, useState } from 'react';
import { Keyboard, type View } from 'react-native';

/**
 * Returns how many pixels of `containerRef` are covered by the keyboard.
 *
 * Depending on the Android version / edge-to-edge mode the system may or may
 * not resize the window when the keyboard opens. Measuring the real overlap
 * works in both cases: if the window was already resized the overlap is 0.
 */
export function useKeyboardInset() {
  const containerRef = useRef<View>(null);
  const keyboardTop = useRef<number | null>(null);
  const [inset, setInset] = useState(0);

  const recompute = useCallback(() => {
    const top = keyboardTop.current;
    if (top === null) {
      setInset(0);
      return;
    }
    containerRef.current?.measureInWindow((_x, y, _w, h) => {
      setInset(Math.max(0, Math.round(y + h - top)));
    });
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', (e) => {
      keyboardTop.current = e.endCoordinates.screenY;
      requestAnimationFrame(recompute);
    });
    const hide = Keyboard.addListener('keyboardDidHide', () => {
      keyboardTop.current = null;
      setInset(0);
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [recompute]);

  return { containerRef, inset, onLayout: recompute };
}
