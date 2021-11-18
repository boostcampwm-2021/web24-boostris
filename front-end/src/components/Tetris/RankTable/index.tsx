import { useEffect } from 'react';

interface RankInterface {
  nickname: string,
  playTime: number,
  attackCnt: number,
  attackedCnt: number
}

function RankTable({ rank }: { rank: RankInterface[] | undefined }) {
  let rankIdx = 1;

  return (
    <table className={'rank-table'}>
      <thead>
        <tr>
          <th>등수</th>
          <th>닉네임</th>
          <th>플레이 타임</th>
          <th>공격 횟수</th>
          <th>받은 횟수</th>
        </tr>
      </thead>
      <tbody>
        { 
          rank?.map((r) => (
          <tr key={r.nickname}>
            <td>[{rankIdx++}]</td>
            <td>{r.nickname}</td>
            <td>{r.playTime}s</td>
            <td>{r.attackCnt}</td>
            <td>{r.attackedCnt}</td>
          </tr>
          ))
        }
      </tbody>
    </table>
  );
}

export default RankTable;
