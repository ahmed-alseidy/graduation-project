import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { authClient } from "./auth-client";

export type OkResponse<T = unknown> = {
  ok: true;
  data: T;
};

export async function authFetch<T>(
  url: string | URL,
  options?: AxiosRequestConfig
): Promise<AxiosResponse<OkResponse<T>>> {
  const config: AxiosRequestConfig = {
    ...options,
    withCredentials: true,
    url: url.toString(),
    headers: {
      ...options?.headers,
    },
  };

  try {
    const response = await axios(config);
    return response;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await authClient.signOut();
      throw new Error("UNAUTHORIZED");
    }

    console.error("Request failed:", error);
    throw error;
  }
}
