export const fetchGetRank: Function = async (rankApiTemplate: Object) => {
  return fetch(`/api/rank`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ rankApiTemplate }),
  }).then((res) => res.json());
};

export const fetchGetMyCntInfo: Function = async (myInfoTemplate: Object) => {
  return fetch(`/api/rank/myInfo`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ myInfoTemplate }),
  }).then((res) => res.json());
};
