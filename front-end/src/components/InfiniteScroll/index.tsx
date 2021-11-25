import React, { useCallback, useEffect, useRef, useState } from 'react';
import './style.scss';

const drawRecent = (list: Array<any>) => {
  if (list.length === 0) return;
  return (
    <>
      {list.map((value) => (
        <div className="recent__list" key={value.game_id}>
          <div>{value.game_date.slice(0, 10)}</div>
          <div>{value.game_mode === 'normal' ? '일반전' : '1 vs 1'}</div>
          <div>{value.ranking}</div>
          <div>{value.play_time}</div>
          <div>{value.attack_cnt}</div>
          <div>{value.attacked_cnt}</div>
        </div>
      ))}
    </>
  );
};

export default function InfiniteScroll({
  nickname,
  MAX_ROWS,
  fetchURL,
  type,
}: {
  nickname: string | undefined;
  MAX_ROWS: number;
  fetchURL: string;
  type: string;
}) {
  const [pageNum, setPageNum] = useState(0);
  const [loading, setLoading] = useState(false);

  const rootRef = useRef(null);
  const observerRef = useRef<any>(null);

  const [list, setList] = useState<any>([]);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(fetchURL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, limit: MAX_ROWS, offset: pageNum }),
    })
      .then((res) => res.json())
      .then((data) => {
        setList((prev: any) => {
          return [...prev, ...data];
        });
        setHasMore(data.length > 0);
        setLoading(false);
      })
      .catch((error) => {
        console.log('error:', error);
      });
  }, [pageNum]);

  const targetRef = useCallback(
    (node) => {
      if (loading) return;
      let options = {
        root: rootRef.current,
        rootMargin: '50px',
        threshold: 0,
      };

      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPageNum((prev) => prev + MAX_ROWS);
        }
      }, options);
      if (node) observerRef.current.observe(node);
    },
    [loading, hasMore]
  );

  return (
    <div
      className={`fancy__scroll ${type === 'profile' ? 'recent__list--scroll' : ''}`}
      ref={rootRef}
    >
      {type === 'profile' && drawRecent(list)}
      <div ref={targetRef}></div>
      <>{loading && <div className="loading">로딩중</div>}</>
    </div>
  );
}
