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
export interface requestApiBody {
  requestee: string;
  requester: string;
}

export interface requestUpdateApiBody extends requestApiBody {
  isAccept: number;
}

export interface requestListApiBody {
  requestee: string;
}
export interface listApiBody {
  id: string;
}

export const makeFriendRequest = async (requestBody: requestApiBody) => {
  return fetch('/api/friend/request', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(requestBody),
  }).then((res) => res.json());
};

export const updateFriendRequest = async (requestBody: requestUpdateApiBody) => {
  return fetch('/api/friend/request-update', {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(requestBody),
  }).then((res) => res.json());
};

export const requestList = async (requestBody: requestListApiBody) => {
  return fetch(`/api/friend/request-list?requestee=${requestBody.requestee}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  }).then((res) => res.json());
};

export const friendList = async (requestBody: listApiBody) => {
  return fetch(`/api/friend/list?requestee=${requestBody.id}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  }).then((res) => res.json());
};
