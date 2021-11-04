import React from 'react';
import './style.scss';

function BubbleButton({
  variant = '',
  label = '',
  handleClick = () => {},
  disabled = false,
}: {
  variant: string;
  label: string;
  handleClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      className={`bubbleBtn bubbleBtn--${variant}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

export default BubbleButton;
