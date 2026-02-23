import { useEffect, useRef } from 'react';

/**
 * setInterval を宣言的に扱うためのカスタムフック。
 * Dan Abramov のブログ記事を参考に実装: 
 * https://overreacted.io/making-setinterval-declarative-with-react-hooks/
 *
 * @param callback 実行するコールバック関数
 * @param delay 遅延時間（ミリ秒）。null を渡すとタイマーを停止。
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef(callback);

  // callback が新しくなったら ref を更新する
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // インターバルをセットアップする
  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}
