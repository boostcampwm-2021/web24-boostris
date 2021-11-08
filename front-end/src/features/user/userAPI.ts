export type googleUserInfoProps = {
  email: string;
  name: string;
  vendor: string;
};

export interface registerDataContent {
  nickname: string;
  message: string;
  oauthInfo: any;
}

export const postNewUser = async (registerData: registerDataContent) => {
  return fetch('/api/register/insert', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ registerData }),
  }).then((res) => res.json());
};

export const fetchGithubUserData = async (code: string) => {
  return fetch('/api/auth/github/code', {
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
  return fetch(`/api/auth/naver/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ accessToken, vendor: 'naver' }),
  }).then((res) => res.json());
};

export const fetchGoogleUserData = async (googleUserInfo: googleUserInfoProps) => {
  return fetch(`/api/auth/google/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(googleUserInfo),
  }).then((res) => res.json());
};
