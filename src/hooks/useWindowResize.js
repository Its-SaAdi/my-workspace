// hooks/useWindowResize.js
import { useEffect, useRef } from "react";
import { WindowResizer } from "../conf/Resizer";

export const useWindowResize = (windowRef, position) => {
  const resizerRef = useRef(null);

  useEffect(() => {
    if (!windowRef.current) return;

    resizerRef.current = new WindowResizer(windowRef.current);

    const el = windowRef.current;
    const right = el.querySelector(".resize-right");
    const bottom = el.querySelector(".resize-bottom");
    const corner = el.querySelector(".resize-corner");

    const onRight = (e) => resizerRef.current.startResize(e, "right");
    const onBottom = (e) => resizerRef.current.startResize(e, "bottom");
    const onCorner = (e) => resizerRef.current.startResize(e, "corner");

    el.style.left = `${position.xOffset}px`;
    el.style.top = `${position.yOffset}px`;

    right?.addEventListener("pointerdown", onRight);
    bottom?.addEventListener("pointerdown", onBottom);
    corner?.addEventListener("pointerdown", onCorner);

    return () => {
      right?.removeEventListener("pointerdown", onRight);
      bottom?.removeEventListener("pointerdown", onBottom);
      corner?.removeEventListener("pointerdown", onCorner);
      resizerRef.current?.destroy?.();
    };
  }, [windowRef, position]);
};
