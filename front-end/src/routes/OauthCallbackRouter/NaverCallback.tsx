import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchNaverUser, selectUser } from '../../features/user/userSlice';

function NaverCallback() {
  const location = useLocation();
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();

  const accessToken = location.hash.split('=')[1].split('&')[0];

  useEffect(() => {
    dispatch(fetchNaverUser(accessToken));
  }, [accessToken, dispatch]);

  return <div>{user.status}</div>;
}
export default NaverCallback;
