import { useAppSelector } from '../../app/hooks';
import { selectUser } from '../../features/user/userSlice';

function useAuth() {
  const { auth, profile } = useAppSelector(selectUser);
  return { auth, profile };
}

export default useAuth;
