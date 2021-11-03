import React from 'react';
import './style.scss';

function BubbleButton({
  variant = '',
  label = '',
  handleClick = () => {},
}: {
  variant: string;
  label: string;
  handleClick: () => void;
}) {
  return (
    <button className={`bubbleBtn bubbleBtn--${variant}`} onClick={handleClick}>
      {label}
    </button>
  );
}

export default BubbleButton;
