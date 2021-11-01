import './style.scss';

function BasicInput({
  label = '',
  placeholder = '',
  type = 'input',
}: {
  label: string;
  placeholder: string;
  type: string;
}) {
  return (
    <label className="input__label--root" htmlFor={label}>
      <div className="input__label--text">{label}</div>
      {type === 'input' && (
        <input id={label} name={label} placeholder={placeholder} />
      )}
      {type === 'textarea' && (
        <textarea id={label} name={label} placeholder={placeholder} rows={5} />
      )}
    </label>
  );
}

export default BasicInput;
