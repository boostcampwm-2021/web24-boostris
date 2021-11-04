export const fetchGithubUserData = async (code: string) => {
  return fetch('/auth/github/code', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({
      code,
    }),
  }).then((res) => res.json());
};

export const fetchNaverUserData = async (accessToken: any) => {
  return fetch(`/auth/naver/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ accessToken, vendor: 'naver' }),
  }).then((res) => res.json());
};
