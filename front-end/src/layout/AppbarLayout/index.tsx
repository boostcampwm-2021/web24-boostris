import { Link } from 'react-router-dom';
import './style.scss';

function AppbarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="layout__root">
      <div className="appbar__container">
        <div className="appbar__container--logo">
          <img src="assets/logo_appbar.png" alt="" />
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
          <Link className="appbar__link" to="/login">
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
