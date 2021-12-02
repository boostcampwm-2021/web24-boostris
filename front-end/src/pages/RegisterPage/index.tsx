import { MouseEventHandler, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  checkAuth,
  clearRegister,
  registerNewUser,
  selectUser,
} from '../../features/user/userSlice';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import BasicButton from '../../components/BasicButton';
import BasicInput from '../../components/BasicInput';
import './style.scss';
import { NICKNAME_REGEX } from '../../constants';

function RegisterPage() {
  const nickNameRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);

  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const onChangeNickname = (e: React.ChangeEvent<HTMLInputElement>) => {
    const NICKNAME_MAX = 10;
    if (e.target.value.length > NICKNAME_MAX) {
      e.target.value = e.target.value.slice(0, -1);
      alert(`글자수는 ${NICKNAME_MAX}자 제한입니다`); // UX 관점에서 개선 필요
    }
  };

  const onChangeMessage = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const MESSAGE_MAX = 50;
    if (e.target.value.length > MESSAGE_MAX) {
      e.target.value = e.target.value.slice(0, -1);
      alert(`상태메세지는 ${MESSAGE_MAX}자 제한입니다`);
    }
  };

  const onSubmitClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    if (!nickNameRef?.current?.value.length) {
      alert('닉네임을 최소한 한글자는 입력해 주세요 !!!');
      return;
    }

    if (!NICKNAME_REGEX.test(nickNameRef?.current?.value)) {
      alert('닉네임은 반드시 한글/영문(대소문자)/숫자로만 이루어져야합니다.');
    } else {
      dispatch(
        registerNewUser({
          nickname: nickNameRef.current.value,
          message: messageRef.current?.value || '',
          oauthInfo: user.profile.id,
        })
      );
    }
  };

  const onCancelClick = () => {
    dispatch(clearRegister());
    navigate('/login');
  };

  useEffect(() => {
    if (user.register.status === 'idle' && user.register.dupCheck !== null) {
      if (user.register.dupCheck) {
        navigate('/');
        dispatch(checkAuth());
      } else {
        alert('이미 존재하는 닉네임 입니다 !');
      }
    }
  }, [dispatch, navigate, user.register.dupCheck, user.register.status]);

  return (
    <div className="register__root full__page--root">
      <div className="register__card--root">
        <p className="register__card--title">BOOSTRIS</p>
        <BasicInput
          label={'닉네임'}
          placeholder="닉네임을 입력해주세요."
          type="input"
          handleChange={onChangeNickname}
          inputRef={nickNameRef}
        />
        <div className="mb--40"></div>
        <BasicInput
          label={'상태메세지'}
          placeholder="상태메세지를 입력해주세요."
          type="textarea"
          handleChange={onChangeMessage}
          inputRef={messageRef}
        />
        <div className="mb--40"></div>
        <div className="register__card--footer">
          <BasicButton variant="contained" label={'제출'} handleClick={onSubmitClick} />
          <BasicButton variant="outlined" label={'취소'} handleClick={onCancelClick} />
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
