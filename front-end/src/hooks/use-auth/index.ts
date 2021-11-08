import { useAppSelector } from '../../app/hooks';
import { selectUser } from '../../features/user/userSlice';

function useAuth() {
  const { profile } = useAppSelector(selectUser);

  return { profile };
}

export default useAuth;
