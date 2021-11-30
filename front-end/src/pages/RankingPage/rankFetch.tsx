export const fetchGetRank: Function = async (rankApiTemplate: Object, signal: AbortSignal) => {
  return fetch(`/api/rank`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ rankApiTemplate }),
    signal,
  }).then((res) => res.json());
};

export const fetchGetMyCntInfo: Function = async (myInfoTemplate: Object, signal: AbortSignal) => {
  return fetch(`/api/rank/myInfo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ myInfoTemplate }),
    signal,
  }).then((res) => res.json());
};
