export const fetchGetStateMessage: Function = async (nickname: String, signal: AbortSignal) => {
  return fetch(`/api/profile/stateMessage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ nickname }),
    signal,
  }).then((res) => res.json());
};

export const fetchGetTotal: Function = async (nickname: String, signal: AbortSignal) => {
  return fetch(`/api/profile/total`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ nickname }),
    signal,
  }).then((res) => res.json());
};

export const fetchUpdateUserState: Function = async (userState: Object) => {
  return fetch(`/api/profile`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ ...userState }),
  }).then((res) => res.json());
};
