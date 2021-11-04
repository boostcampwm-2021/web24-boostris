import BasicButton from '../../components/BasicButton';
import BasicInput from '../../components/BasicInput';
import './style.scss';
import { selectUser } from '../../features/user/userSlice';
import { useAppSelector } from '../../app/hooks';

const registerButtonHandler = async (
  registerData: any,
  label: string,
  history: any
) => {
  if (label === '제출') {
    console.log(registerData);
    if (!registerData['nickname'].length) {
      alert('닉네임을 최소한 한글자는 입력해 주세요 !!!');
      return;
    }
    let registerCheck: any = await fetch('/register/insert', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ registerData: registerData }),
    });
    registerCheck = await registerCheck.json();
    if (!registerCheck['dupCheck']) {
      alert('이미 존재하는 닉네임 입니다 !');
      return;
    } else {
      history.replace('/');
      // 다음 페이지로 넘어가는 로직 필요
      // 유저의 닉네임 등등 필요함
    }
  } else if (label === '취소') {
    history.replace('/login');
  }
};

/* Input 박스 로직 */

const onChangeNickname = (e: any, registerData: any) => {
  const NICKNAME_MAX = 10;

  if (e.target.value.length > NICKNAME_MAX) {
    e.target.value = e.target.value.slice(0, -1);
    alert(`글자수는 ${NICKNAME_MAX}자 제한입니다`); // UX 관점에서 개선 필요
  }
  registerData.nickname = e.target.value;
};

const onChangeMessage = (e: any, registerData: any) => {
  const MESSAGE_MAX = 50;

  if (e.target.value.length > MESSAGE_MAX) {
    e.target.value = e.target.value.slice(0, -1);
    alert(`상태메세지는 ${MESSAGE_MAX}자 제한입니다`);
  }
  registerData.message = e.target.value;
};

function RegisterPage() {
  interface registerDataContent {
    nickname: string;
    message: string;
    oauthInfo: any;
  }
  const registerData: registerDataContent = {
    nickname: '',
    message: '',
    oauthInfo: {},
  };
  const user = useAppSelector(selectUser);

  registerData.oauthInfo = user.profile.id;

  return (
    <div className="register__root full__page--root">
      <div className="register__card--root">
        <p className="register__card--title">BOOSTRIS</p>
        <BasicInput
          label={'닉네임'}
          placeholder="닉네임을 입력해주세요."
          type="input"
          registerData={registerData}
          onChangeNickname={onChangeNickname}
          onChangeMessage={onChangeMessage}
        />
        <div className="mb--40"></div>
        <BasicInput
          label={'상태메세지'}
          placeholder="상태메세지를 입력해주세요."
          type="textarea"
          registerData={registerData}
          onChangeNickname={onChangeNickname}
          onChangeMessage={onChangeMessage}
        />
        <div className="mb--40"></div>
        <div className="register__card--footer">
          <BasicButton
            variant="contained"
            label={'제출'}
            registerData={registerData}
            submit={registerButtonHandler}
          />
          <BasicButton
            variant="outlined"
            label={'취소'}
            registerData={registerData}
            submit={registerButtonHandler}
          />
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
