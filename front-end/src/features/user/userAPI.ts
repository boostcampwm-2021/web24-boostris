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
