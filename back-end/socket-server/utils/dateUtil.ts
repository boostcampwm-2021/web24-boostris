// 현재 시간을 구하는 함수 yyyy-mm-dd hh:mm:ss 형태로 (DB의 datetime형태랑 동일)
export const getTimeStamp = (date) => {
  let d = new Date(date);
  let s =
    leadingZeros(d.getFullYear(), 4) +
    '-' +
    leadingZeros(d.getMonth() + 1, 2) +
    '-' +
    leadingZeros(d.getDate(), 2) +
    ' ' +
    leadingZeros(d.getHours(), 2) +
    ':' +
    leadingZeros(d.getMinutes(), 2) +
    ':' +
    leadingZeros(d.getSeconds(), 2);

  return s;
};

// 0 붙이기
const leadingZeros = (n, digits) => {
  let zero = '';
  n = n.toString();

  if (n.length < digits) {
    for (let i = 0; i < digits - n.length; i++) zero += '0';
  }

  return zero + n;
};
