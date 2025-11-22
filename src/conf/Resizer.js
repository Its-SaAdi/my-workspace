export class WindowResizer {
    constructor(element) {
        this.element = element;

        this.startWidth = 0;
        this.startHeight = 0;
        this.startX = 0;
        this.startY = 0;

        this.isDragging = false;
        this.resizeDirection = null;
        // this.resizeRef = null;

        this._onPointerMove = this.handleResize.bind(this);
        this._onPointerUp = this.stopResize.bind(this);

    }

    startResize(e, direction) {
        // e.preventDefault();
        this.isDragging = true;
        this.resizeDirection = direction;

        const rect = this.element.getBoundingClientRect();
        this.startX = e.clientX;
        this.startY = e.clientY;

        this.startWidth = rect.width;
        this.startHeight = rect.height;

        document.body.style.userSelect = "none";
        
        try {
            e.target.setPointerCapture(e.pointerId);
        } catch (error) {
            console.warn("Couldn't find any event object at startResize()");
        }

        // document.addEventListener("pointermove", this.handleResize);
        // document.addEventListener("pointerup", this.stopResize);

        document.addEventListener("pointermove", this._onPointerMove);
        document.addEventListener("pointerup", this._onPointerUp);

    }

    handleResize(e) {
        if (!this.isDragging) return;
        // if (this.resizeRef) return;

        // this.resizeRef = requestAnimationFrame(() => {


        //     this.resizeRef = null;
        // });

        let dx = e.clientX - this.startX;
        let dy = e.clientY - this.startY;

        // console.log(dx, dy);


        // const MIN_W = 250;
        // const MIN_H = 150;
        // const MAX_W = 900;
        // const MAX_H = 700;

        if (this.resizeDirection === "right" || this.resizeDirection === "corner") {
            this.element.style.width = Math.max(this.startWidth + dx, 300) + "px";
        }
        if (this.resizeDirection === "bottom" || this.resizeDirection === "corner") {
            this.element.style.height = Math.max(this.startHeight + dy, 140) + "px";
        }
    }

    stopResize(e) {
        this.isDragging = false;
        this.resizeDirection = null;

        document.body.style.userSelect = "auto";
        
        try {
            e.target.releasePointerCapture?.(e.pointerId);
        } catch (error) {
            console.warn("Couldn't find the event object at stopResize()");
        }

        // document.removeEventListener("pointermove", this.handleResize);
        // document.removeEventListener("pointerup", this.stopResize);

        document.removeEventListener("pointermove", this._onPointerMove);
        document.removeEventListener("pointerup", this._onPointerUp);
    }

    // final cleanup if component unmounts
    destroy() {
        document.removeEventListener("pointermove", this._onPointerMove);
        document.removeEventListener("pointerup", this._onPointerUp);
    }
}