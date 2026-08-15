import { useEffect } from "react";

const Toast = ({ message, type = "success", onClose, duration = 3500 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isError = type === "error";

  return (
    <div
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        background: isError ? "rgba(255, 107, 92, 0.95)" : "rgba(41, 182, 166, 0.95)",
        color: "#ffffff",
        padding: "12px 20px",
        borderRadius: "10px",
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        fontSize: "14px",
        fontWeight: 600,
        animation: "toastSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <span>{isError ? "⚠️" : "✅"}</span>
      <span>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: "transparent",
          border: "none",
          color: "#ffffff",
          cursor: "pointer",
          fontSize: "16px",
          padding: 0,
          marginLeft: "8px",
          lineHeight: 1,
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
