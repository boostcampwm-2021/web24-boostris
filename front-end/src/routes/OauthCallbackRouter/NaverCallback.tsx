import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchNaverUser, selectUser } from '../../features/user/userSlice';

function NaverCallback() {
  const location = useLocation();
  const history = useHistory();
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();

  const accessToken = location.hash.split('=')[1].split('&')[0];

  useEffect(() => {
    dispatch(fetchNaverUser(accessToken));
  }, [accessToken, dispatch]);

  useEffect(() => {
    if (
      (user.profile.id && user.status === 'idle') ||
      user.status === 'failed'
    ) {
      if (user.profile.isOurUser) {
        history.replace('/', { id: user.profile.id });
      } else {
        history.replace('/register', { id: user.profile.id });
      }
    }
  }, [history, user.profile.id, user.profile.isOurUser, user.status]);

  return <div>{user.status}</div>;
}
export default NaverCallback;
