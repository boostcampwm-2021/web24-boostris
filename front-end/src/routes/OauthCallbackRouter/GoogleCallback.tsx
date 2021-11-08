import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchGoogleUser, selectUser } from '../../features/user/userSlice';

function GoogleCallback() {
  const {
    state,
  }: {
    state: {
      profileObj: any;
    };
  } = useLocation();

  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(
      fetchGoogleUser({
        email: state.profileObj.email,
        name: state.profileObj.name,
        vendor: 'google',
      })
    );
  }, [dispatch, state.profileObj.email, state.profileObj.name]);

  return <div>{user.profile.status}</div>;
}
export default GoogleCallback;
