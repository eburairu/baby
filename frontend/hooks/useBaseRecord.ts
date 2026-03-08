import useSWR from 'swr';
import { client, throwOnError } from '@/lib/api-client';

/**
 * 記録リソース（授乳、おむつ、睡眠など）の CRUD を行う基底フック
 */
export function useBaseRecord<T, TCreate, TUpdate>(
  babyId: string | number | null,
  endpoint: string,
  pathParam: string
) {
  const numericBabyId = typeof babyId === 'string' ? parseInt(babyId, 10) : babyId;

  // データの取得
  const { data, error, mutate, isLoading } = useSWR<T[]>(
    numericBabyId ? `/api/${endpoint}/?baby_id=${numericBabyId}` : null,
    () => throwOnError((client.GET as any)(`/api/${endpoint}/`, {
      params: { query: { baby_id: numericBabyId! } }
    })),
    { keepPreviousData: true }
  );

  // レコード追加
  const add = async (record: TCreate): Promise<T | undefined> => {
    if (!numericBabyId) return undefined;
    const newRecord = await throwOnError((client.POST as any)(`/api/${endpoint}/`, {
      body: record
    }));
    mutate();
    return newRecord as T;
  };

  // レコード更新
  const update = async (id: number, record: TUpdate): Promise<T | undefined> => {
    const updatedRecord = await throwOnError((client.PATCH as any)(`/api/${endpoint}/{${pathParam}}`, {
      params: { path: { [pathParam]: id } },
      body: record
    }));
    mutate();
    return updatedRecord as T;
  };

  // レコード削除
  const remove = async (id: number) => {
    await throwOnError((client.DELETE as any)(`/api/${endpoint}/{${pathParam}}`, {
      params: { path: { [pathParam]: id } }
    }));
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
