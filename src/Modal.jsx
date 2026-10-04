import React, { useEffect, useId, useRef } from "react";
export default function Modal({
  title,
  children,
  onClose,
  actions,
  busy = false,
}) {
  const ref = useRef(null),
    id = useId();
  useEffect(() => {
    const previous = document.activeElement;
    ref.current.showModal();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      previous?.isConnected && previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={id}
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
    >
      <h2 id={id}>{title}</h2>
      <div className="modal-body">{children}</div>
      <div className="modal-actions">
        {actions || (
          <button autoFocus onClick={onClose}>
            ပိတ်မည်
          </button>
        )}
      </div>
    </dialog>
  );
}
