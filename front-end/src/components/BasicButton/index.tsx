import './style.scss';

function BasicButton({ variant = 'contained', label = '' }) {
  return <button className={`btn__root btn__root--${variant}`}>{label}</button>;
}

export default BasicButton;
