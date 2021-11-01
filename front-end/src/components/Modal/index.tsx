import { createPortal } from 'react-dom';
import './style.scss';

function Modal({
  children,
  open,
  onClose,
}: {
  children: React.ReactNode;
  open: boolean;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }
  return createPortal(
    <div>
      <div className="overlay" onClick={onClose}></div>
      <div className="modal">
        <div className="modal-content">{children}</div>
      </div>
    </div>,
    document.getElementById('portal-root') as HTMLElement
  );
}

export default Modal;
