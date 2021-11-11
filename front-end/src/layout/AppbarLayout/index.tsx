import { Link } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { logOut } from '../../features/user/userSlice';
import './style.scss';

function AppbarLayout({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const handleLogout = () => {
    dispatch(logOut());
  };
  return (
    <div className="layout__root">
      <div className="appbar__container">
        <div className="appbar__container--logo">
          <img src="/assets/logo_appbar.png" alt="" />
        </div>
        <div className="appbar__conatiner--link">
          <Link className="appbar__link" to="/">
            로비
          </Link>
          <Link className="appbar__link" to="/rank">
            랭킹
          </Link>
          <Link className="appbar__link" to="/profile">
            프로필
          </Link>
          <Link className="appbar__link" onClick={handleLogout} to="/login">
            로그아웃
          </Link>
        </div>
      </div>
      <div className="layout__content--root">{children}</div>
      <div className="footer__space"></div>
    </div>
  );
}

export default AppbarLayout;
