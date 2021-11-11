import axios from 'axios';
import * as jwt from 'jsonwebtoken';

export const getGithubUser = async (token) => {
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
};

export const getUserInfoFromNaver = async (accessToken) => {
  const header = 'Bearer ' + accessToken;
  const apiUrl = 'https://openapi.naver.com/v1/nid/me';
  const headers = {
    Authorization: header,
  };
  try {
    const { data } = await axios.get(apiUrl, {
      headers: headers,
    });
    return data;
  } catch (err) {
    /*error 처리 */
  }
};

export const setJWT = (req, res, { nickname, oauth_id }) => {
  const jwtSignature = jwt.sign(
    { expiresIn: '10h', nickname, oauth_id }, // 임의 값 넣어놓음
    process.env.JWT_SECRET_KEY
  );
  res.cookie('user', jwtSignature, {
    expires: new Date(Date.now() + 10 * 60 * 60 * 1000),
  });
};
