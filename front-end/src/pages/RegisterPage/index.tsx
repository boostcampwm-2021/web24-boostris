import BasicButton from '../../components/BasicButton';
import BasicInput from '../../components/BasicInput';
import './style.scss';

function RegisterPage() {
  return (
    <div className="register__root full__page--root">
      <div className="register__card--root">
        <p className="register__card--title">BOOSTRIS</p>
        <BasicInput
          label={'닉네임'}
          placeholder="닉네임을 입력해주세요."
          type="input"
        />
        <div className="mb--40"></div>
        <BasicInput
          label={'상태메세지'}
          placeholder="상태메세지를 입력해주세요."
          type="textarea"
        />
        <div className="mb--40"></div>
        <div className="register__card--footer">
          <BasicButton variant="contained" label={'제출'} />
          <BasicButton variant="outlined" label={'취소'} />
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
