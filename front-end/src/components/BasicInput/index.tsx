import { useCallback, useEffect, useRef } from 'react';
import './style.scss';

function BasicInput({
  label = '',
  placeholder = '',
  type = 'input',
  registerData = {}
}: {
  label: string;
  placeholder: string;
  type: string;
  registerData: any
}) {
  const NICKNAME_MAX = 10;
  const MESSAGE_MAX = 50;

  const onChangeNickname = useCallback(e=>{
    if (e.target.value.length > NICKNAME_MAX) {
      e.target.value = e.target.value.slice(0, -1);
      alert(`글자수는 ${NICKNAME_MAX}자 제한입니다`) // UX 관점에서 개선 필요
    }
    registerData.nickname = e.target.value;
  },[]);

  const onChangeMessage = useCallback(e=>{
    if (e.target.value.length > MESSAGE_MAX) {
      e.target.value = e.target.value.slice(0, -1);
      alert(`상태메세지는 ${MESSAGE_MAX}자 제한입니다`)
    }
    registerData.message = e.target.value;
  }, []);

  return (
    <label className="input__label--root" htmlFor={label}>
      <div className="input__label--text">{label}</div>
      {type === 'input' && (
        <input id={label} name={label} onChange={onChangeNickname} placeholder={placeholder}/>
      )}
      {type === 'textarea' && (
        <textarea id={label} name={label} onChange={onChangeMessage} placeholder={placeholder} rows={5}/>
      )}
    </label>
  );
}

export default BasicInput;
