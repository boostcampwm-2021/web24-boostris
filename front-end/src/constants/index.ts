export const OAUTH_LIST: { type: string; link: string }[] = [
  {
    type: 'naver',
    link: `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}`,
  },
  {
    type: 'google',
    link: `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}`,
  },
  {
    type: 'github',
    link: `https://github.com/login/oauth/authorize?client_id=${process.env.REACT_APP_GITHUB_CLIENT_ID}`,
  },
];

export const OAUTH_LIST_INDEX = {
  naver: 0,
  google: 1,
  github: 2,
};
