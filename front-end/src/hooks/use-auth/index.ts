import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { checkAuth, selectUser } from '../../features/user/userSlice';

function useAuth() {
  const { auth } = useAppSelector(selectUser);
  return { auth };
}

export default useAuth;
