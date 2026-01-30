import { useCallback } from "react";

const HEADER_HEIGHT = 48;
const SNAP_THRESHOLD = 0;

export const useWindowBounds = () => {
    return useCallback((x, y, winEl) => {
    if (!winEl) return { x, y };

    const rect = winEl.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let boundedX = x;
    let boundedY = y;

    // Clamp horizontal
    if (x < SNAP_THRESHOLD) boundedX = 0;
    else if (x + rect.width > vw - SNAP_THRESHOLD)
      boundedX = vw - rect.width;

    // Clamp vertical
    // if (y < SNAP_THRESHOLD) boundedY = 0;
    // else if (y + rect.height > vh - SNAP_THRESHOLD)
    //   boundedY = vh - rect.height;

    // Normal window snapping
    if (y < SNAP_THRESHOLD) boundedY = 0;
    else if (y + rect.height > vh)
      boundedY = Math.min(
        Math.max(y, 0),
        vh - HEADER_HEIGHT
      );

    return { x: boundedX, y: boundedY };
  }, []);
}