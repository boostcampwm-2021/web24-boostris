import './style.scss';
import { useHistory } from 'react-router-dom';

function BasicButton({ 
  variant = 'contained', 
  label = '', 
  registerData = {},
  submit
}: {
  variant: string, 
  label: string, 
  registerData: object,
  submit: Function,
}) {
  const history = useHistory();

  return <button onClick={()=>{submit(registerData, label, history)}} className={`btn__root btn__root--${variant}`}>{label}</button>;
}

export default BasicButton;
