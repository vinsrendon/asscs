import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

function Modal({ isOpen, onClose, children }) {
    const [shouldRender, setShouldRender] = useState(isOpen);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let timer;

        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShouldRender(true);

            timer = setTimeout(() => {
                setVisible(true);
            }, 10);
        } else {
            setVisible(false);

            timer = setTimeout(() => {
                setShouldRender(false);
            }, 300);
        }

        return () => clearTimeout(timer);
    }, [isOpen]);

    if (!shouldRender) return null;

    return createPortal(
        <div
            className={`fixed inset-0 z-999 flex items-center justify-center
                p-4 bg-black/50 transition-opacity duration-300 ease-in-out
                ${visible ? "opacity-100" : "opacity-0"}`}
            onClick={onClose}
        >
            <div
                className={`w-[90%] max-w-150 rounded-lg bg-white p-6
                    max-h-[90vh] overflow-auto shadow-xl
                    transition-all duration-300 ease-out transform
                    ${
                        visible
                            ? "translate-y-0 scale-100 opacity-100"
                            : "translate-y-5 scale-95 opacity-0"
                    }`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-2xl bg-gray-800
                            hover:bg-gray-700 px-4 py-2 text-white hover:rounded-md duration-200 transition-all"
                    >
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
