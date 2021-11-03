import './style.scss';

function BasicInput({
  label = '',
  placeholder = '',
  type = 'input',
  registerData = {},
  onChangeNickname,
  onChangeMessage
}: {
  label: string;
  placeholder: string;
  type: string;
  registerData: any,
  onChangeNickname: Function,
  onChangeMessage: Function
}) {

  return (
    <label className="input__label--root" htmlFor={label}>
      <div className="input__label--text">{label}</div>
      {type === 'input' && (
        <input id={label} name={label} onChange={(e)=>onChangeNickname(e, registerData)} placeholder={placeholder}/>
      )}
      {type === 'textarea' && (
        <textarea id={label} name={label} onChange={(e)=>onChangeMessage(e, registerData)} placeholder={placeholder} rows={5}/>
      )}
    </label>
  );
}

export default BasicInput;
