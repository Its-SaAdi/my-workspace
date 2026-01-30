import { useEffect, useRef, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { focusWindow, updateWindow } from "../features/windows/windowSlice";

export const useWindowDrag = ({ windowRef, windowId, initialPosition, getBoundedPosition }) => {
    const dispatch = useDispatch();
    const frameRef = useRef(null);
    const lastPosition = useRef(initialPosition);
    const pointerIdRef = useRef(null);

    const [position, setPosition] = useState(initialPosition);
    const [isDragging, setIsDragging] = useState(false);
    const [offset, setOffset] = useState({ xOffset: 0, yOffset: 0 });

    const onPointerDown = (e) => {
        if (e.target.closest(".window-controls")) return;

        e.preventDefault();

        e.currentTarget.setPointerCapture(e.pointerId);
        pointerIdRef.current = e.pointerId;

        setIsDragging(true);
        setOffset({
            xOffset: e.clientX - position.xOffset,
            yOffset: e.clientY - position.yOffset,
        });

        dispatch(focusWindow(windowId));
    };

    const onPointerMove = useCallback((e) => {
        if (!isDragging || e.pointerId !== pointerIdRef.current) return;
        if (!windowRef.current) return;

        const rawX = e.clientX - offset.xOffset;
        const rawY = e.clientY - offset.yOffset;

        const { x, y } = getBoundedPosition(
            rawX,
            rawY,
            windowRef.current
        );

        lastPosition.current = { xOffset: x, yOffset: y };

        cancelAnimationFrame(frameRef.current);
        frameRef.current = requestAnimationFrame(() => {
            windowRef.current.style.left = `${x}px`;
            windowRef.current.style.top = `${y}px`;
        });
    }, [isDragging, offset, getBoundedPosition, windowRef]);

    const onPointerUp = useCallback((e) => {
        if (!isDragging || e.pointerId !== pointerIdRef.current) return;
        if (!windowRef.current) return;

        setIsDragging(false);
        pointerIdRef.current = null;
        cancelAnimationFrame(frameRef.current);

        const { xOffset, yOffset } = lastPosition.current;
        const { x, y } = getBoundedPosition(
            xOffset,
            yOffset,
            windowRef.current
        );

        const finalPos = { xOffset: x, yOffset: y };

        setPosition(finalPos);
        dispatch(updateWindow({ id: windowId, data: finalPos }));

    }, [isDragging, getBoundedPosition, dispatch, windowId, windowRef]);

    useEffect(() => {
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
        window.addEventListener("pointercancel", onPointerUp);
        return () => {
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
            window.removeEventListener("pointercancel", onPointerUp);
        };
    }, [onPointerMove, onPointerUp]);

    return {
        position,
        onPointerDown,
    };
};