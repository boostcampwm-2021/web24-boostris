import { forwardRef, useImperativeHandle, useState } from 'react';
import { createPortal } from 'react-dom';
import './style.scss';

const Modal = forwardRef(
  (
    {
      title = '',
      type = 'default',
      children,
    }: { title: string; type: string; children: React.ReactNode },
    ref
  ) => {
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
        <div className={`modal modal--md modal--${type}`}>
          <div className="modal-content">
            {type === 'default' && <div className="modal__title">[{title}]</div>}
            {type === 'notification' && (
              <button className="close__btn" onClick={close}>
                X
              </button>
            )}
            {type === 'profile' && (
              <div className="modal--profile__header">
                <div>_</div>
                <div>[{title}]</div>
                <button className="close__btn" onClick={close}>
                  X
                </button>
              </div>
            )}
            {children}
          </div>
        </div>
      </div>,
      document.getElementById('portal-root') as HTMLElement
    );
  }
);

export default Modal;
