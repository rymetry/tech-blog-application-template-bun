'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getSnapshot = () => String(new Date().getFullYear());

/** ビルド時に確定した年。サーバースナップショットとして使用する。 */
const BUILD_YEAR = String(new Date().getFullYear());
const getServerSnapshot = () => BUILD_YEAR;

/**
 * 現在の年をレンダリングするクライアントコンポーネント。
 *
 * `cacheComponents` モードではプリレンダリング中に `new Date()` を
 * 呼ぶと時刻依存でキャッシュが不安定になるが、年は長期間変わらない
 * ためビルド時の値を固定し、ハイドレーション時に最新値へ更新する。
 */
export function CopyrightYear() {
  const year = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return <>{year}</>;
}
