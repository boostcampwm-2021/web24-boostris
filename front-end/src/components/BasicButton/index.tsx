import './style.scss';
import { MouseEventHandler } from 'react';

function BasicButton({
  variant = 'contained',
  label = '',
  handleClick,
}: {
  variant: string;
  label: string;
  handleClick: MouseEventHandler<HTMLButtonElement>;
}) {
  return (
    <button onClick={handleClick} className={`btn__root btn__root--${variant}`}>
      {label}
    </button>
  );
}

export default BasicButton;
