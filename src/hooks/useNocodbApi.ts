// useNocodbApi.ts
import { useState, useEffect } from "react";

const NOCODB_BASE_URL = "https://nocodb.tallerdepixeles.com/api/v2";
const NOCODB_TOKEN = "L8cqzqhbY5iOxAhTgmn5gNzhKP4IV_7QOGs-Xe6z";

interface ApiParams {
  baseId: string;
  tableId: string;
  viewId?: string;
  filters?: Record<string, any>;
  sort?: string;
  limit?: number;
  offset?: number;
}

export function useNocodbApi<T>(params: ApiParams | null) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAllData = async () => {
    if (!params) return;
    setLoading(true);
    setError(null);

    try {
      let offset = 0;
      const limit = 1000;
      let allData: T[] = [];
      let keepGoing = true;

      while (keepGoing) {
        const queryParams = new URLSearchParams();
        queryParams.append("limit", limit.toString());
        queryParams.append("offset", offset.toString());

        if (params.viewId) queryParams.append("viewId", params.viewId);
        if (params.sort) queryParams.append("sort", params.sort);
        if (params.filters) {
          Object.entries(params.filters).forEach(([key, value]) => {
            queryParams.append("where", `(${key},eq,${value})`);
          });
        }

        const url = `${NOCODB_BASE_URL}/tables/${params.tableId}/records?${queryParams}`;

        const response = await fetch(url, {
          headers: {
            "xc-token": NOCODB_TOKEN,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        const batch = result.list || [];

        allData = allData.concat(batch);
        offset += batch.length;
        keepGoing = batch.length === limit;
      }

      setData(allData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params) {
      fetchAllData();
    }
  }, [params?.baseId, params?.tableId, params?.viewId]);

  return { data, loading, error, refetch: fetchAllData };
}
