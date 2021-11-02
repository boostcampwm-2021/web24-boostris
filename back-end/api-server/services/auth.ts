import axios from 'axios';

export async function getGithubUser(token) {
  try {
    const { data } = await axios.get('https://api.github.com/user', {
      headers: {
        Authorization: `token ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return data;
  } catch (err) {
    throw err;
  }
}
