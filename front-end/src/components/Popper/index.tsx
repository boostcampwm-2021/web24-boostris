import { forwardRef, MouseEventHandler, useImperativeHandle, useState } from 'react';
import { createPortal } from 'react-dom';
import ProfileModal from '../ProfileModal';
import './style.scss';

const Popper = forwardRef(({ children }: { children: React.ReactNode }, ref) => {
  const [display, setDisplay] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [nickname, setNickname] = useState('');

  useImperativeHandle(ref, () => ({
    open,
    close,
    setPosition,
    setUserNickname,
  }));
  const open = () => {
    setDisplay(true);
  };

  const close = () => {
    setDisplay(false);
  };

  const setUserNickname = (name: string) => {
    setNickname(name);
  };

  const setPosition = (x: number, y: number) => {
    setPos({ x, y });
  };

  if (!display) {
    return null;
  }
  const handleClick: MouseEventHandler = (e) => {
    e.stopPropagation();
  };
  return createPortal(
    <div>
      <div
        className="popper"
        onClick={handleClick}
        style={{
          top: `${pos.y + 30}px`,
          left: `${pos.x + 30}px`,
        }}
      >
        <div className="popper-content">{children}</div>
      </div>
      <ProfileModal nickname={nickname} />
    </div>,
    document.getElementById('popper-root') as HTMLElement
  );
});

export default Popper;
