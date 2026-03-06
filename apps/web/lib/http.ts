export type OkResponse<T = unknown> = {
  ok: true;
  data: T;
};

export type ErrorResponse = {
  ok: false;
  error: string;
  statusCode?: number;
  details?: unknown;
};
