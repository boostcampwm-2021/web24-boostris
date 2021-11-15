import { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../app/hooks';
import { selectUser } from '../../features/user/userSlice';
import GithubCallback from './GithubCallback';
import GoogleCallback from './GoogleCallback';
import NaverCallback from './NaverCallback';

function OauthCallbackRouter() {
  const navigate = useNavigate();

  const user = useAppSelector(selectUser);

  useEffect(() => {
    if ((user.profile.id && user.profile.status === 'idle') || user.profile.status === 'failed') {
      if (user.profile.isOurUser) {
        navigate('/');
      } else {
        navigate('/register');
      }
    }
  }, [navigate, user.profile.id, user.profile.isOurUser, user.profile.status]);

  return (
    <Routes>
      <Route path="github/*" element={<GithubCallback />} />
      <Route path="naver/*" element={<NaverCallback />} />
      <Route path="google/*" element={<GoogleCallback />} />
    </Routes>
  );
}

export default OauthCallbackRouter;
