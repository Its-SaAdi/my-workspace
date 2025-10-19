// src/components/window/Window.jsx
import React from "react";

const Window = ({ title, children, onClose, style }) => {
  return (
    <div
      className="absolute bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg overflow-hidden text-white"
      style={{
        width: "400px",
        top: "100px",
        left: "100px",
        ...style,
      }}
    >
      {/* Title Bar */}
      <div className="flex justify-between items-center bg-white/10 px-4 py-2 cursor-grab">
        <span className="font-medium text-sm">{title}</span>
        <button
          onClick={onClose}
          className="text-sm text-gray-400 hover:text-red-400"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="p-4">{children}</div>
    </div>
  );
};

export default Window;
