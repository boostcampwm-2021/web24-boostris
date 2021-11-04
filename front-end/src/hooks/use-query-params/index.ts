import { useLocation } from 'react-router-dom';

function useQueryParams(key: string) {
  return new URLSearchParams(useLocation().search).get(key);
}

export default useQueryParams;
