import React, { useCallback, useEffect, useRef, useState } from 'react';
import './style.scss';

export default function InfinityScroll() {
  const MAX_ROWS = 5;

  const [pageNum, setPageNum] = useState(0);
  const [loading, setLoading] = useState(false);

  const rootRef = useRef(null);
  const observerRef = useRef<any>(null);

  const [list, setList] = useState<any>([]);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setLoading(true);

    fetch('/api/profile/recent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: '뭐', limit: MAX_ROWS, offset: pageNum }),
    })
      .then((res) => res.json())
      .then((data) => {
        setList((prev: any) => {
          return [...prev, ...data.recentList];
        });
        setHasMore(data.recentList.length > 0);
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
        rootMargin: '0px',
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
    <div className="ScrollContainer" ref={rootRef}>
      {list.map((m: any, i: number) => {
        return <div key={i}>{m['game_date']}</div>;
      })}
      <div ref={targetRef}></div>
      <>{loading && <div>로딩중</div>}</>
    </div>
  );
}
