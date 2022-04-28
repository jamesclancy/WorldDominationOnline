async function request<TResponse>(
  url: string,
  config?: RequestInit
): Promise<TResponse> {
  const response = await fetch(url, config);
  const responseData = await response.json();
  return responseData;
}

export const api = {
  get: <TResponse>(url: string) => request<TResponse>(url),

  post: <TBody extends BodyInit, TResponse>(url: string, body: TBody) =>
    request<TResponse>(url, { method: "POST", body }),
};
