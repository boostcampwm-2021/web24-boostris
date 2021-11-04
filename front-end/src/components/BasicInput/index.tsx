import './style.scss';

function BasicInput({
  label = '',
  placeholder = '',
  type = 'input',
  handleChange = () => {},
  inputRef,
}: {
  label: string;
  placeholder: string;
  type: string;
  handleChange: Function;
  inputRef: any;
}) {
  return (
    <label className="input__label--root" htmlFor={label}>
      <div className="input__label--text">{label}</div>
      {type === 'input' && (
        <input
          id={label}
          name={label}
          onChange={(e) => handleChange(e)}
          placeholder={placeholder}
          ref={inputRef}
        />
      )}
      {type === 'textarea' && (
        <textarea
          id={label}
          name={label}
          onChange={(e) => handleChange(e)}
          placeholder={placeholder}
          rows={5}
          ref={inputRef}
        />
      )}
    </label>
  );
}

export default BasicInput;
