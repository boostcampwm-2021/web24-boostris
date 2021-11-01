import { forwardRef, useImperativeHandle, useState } from 'react';
import { createPortal } from 'react-dom';
import './style.scss';

const Modal = forwardRef(({ children }: { children: React.ReactNode }, ref) => {
  const [display, setDisplay] = useState(false);

  useImperativeHandle(ref, () => ({
    open,
    close,
  }));
  const open = () => {
    setDisplay(true);
  };

  const close = () => {
    setDisplay(false);
  };

  if (!display) {
    return null;
  }
  return createPortal(
    <div>
      <div className="overlay" onClick={close}></div>
      <div className="modal">
        <div className="modal-content">{children}</div>
      </div>
    </div>,
    document.getElementById('portal-root') as HTMLElement
  );
});

export default Modal;
