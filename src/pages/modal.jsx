import { createPortal } from "react-dom";

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>        
        <div className="w-[90%] max-w-150 rounded-lg bg-white p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-end">
                <button onClick={onClose} className="cursor-pointer rounded bg-gray-800 px-4 py-2 text-white" >
                    Close
                </button>
            </div>
            {children}        
        </div>
    </div>,
    document.getElementById("modal-root")
  );
}

export default Modal;