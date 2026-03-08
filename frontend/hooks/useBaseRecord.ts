import useSWR from 'swr';
import { api, fetcher } from '@/lib/api';

/**
 * 記録リソース（授乳、おむつ、睡眠など）の CRUD を行う基底フック
 */
export function useBaseRecord<T, TCreate, TUpdate>(
  babyId: string | number | null,
  endpoint: string
) {
  const numericBabyId = typeof babyId === 'string' ? parseInt(babyId, 10) : babyId;

  // データの取得
  const { data, error, mutate, isLoading } = useSWR<T[]>(
    numericBabyId ? `/${endpoint}/?baby_id=${numericBabyId}` : null,
    fetcher,
    { keepPreviousData: true }
  );

  // レコード追加
  const add = async (record: TCreate): Promise<T | undefined> => {
    if (!numericBabyId) return undefined;
    const newRecord = await api.post<T, TCreate>(`/${endpoint}/`, record);
    mutate();
    return newRecord;
  };

  // レコード更新
  const update = async (id: number, record: TUpdate): Promise<T | undefined> => {
    const updatedRecord = await api.patch<T, TUpdate>(`/${endpoint}/${id}/`, record);
    mutate();
    return updatedRecord;
  };

  // レコード削除
  const remove = async (id: number) => {
    await api.delete(`/${endpoint}/${id}/`);
    mutate();
  };

  return {
    data,
    isLoading,
    isError: error,
    add,
    update,
    remove,
    mutate,
    refresh: mutate,
  };
}
