import React from 'react';
import './style.scss';

export default function Line({
  marginTop,
  marginLeft,
  marginRight,
  marginBottom,
}: {
  marginTop: string;
  marginLeft: string;
  marginRight: string;
  marginBottom: string;
}) {
  return (
    <div
      className="line"
      style={{ margin: `${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px` }}
    ></div>
  );
}
