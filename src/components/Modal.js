import React from "react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999;
        }

        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 10px;
          min-width: 300px;
          max-width: 500px;
          width: 90%;
          position: relative;
          animation: modal-fade-in 0.2s ease-out;
        }

        .modal-close {
          position: absolute;
          top: 8px;
          right: 10px;
          font-size: 20px;
          border: none;
          background: none;
          cursor: pointer;
        }

        @keyframes modal-fade-in {
          from {
            transform: scale(0.95);
            opacity: 0;
          }
          to {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>

      <div className="modal-overlay" onClick={onClose}>
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
        >
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
          {children}
        </div>
      </div>
    </>
  );
};

export default Modal;
