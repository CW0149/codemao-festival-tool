import { ApiResponse } from "../constants/types";

export const postData = (
  token: string,
  url: string,
  query: Record<string, unknown>
): Promise<ApiResponse> => {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
      token,
    },
    body: JSON.stringify(query),
  }).then((res) => {
    return res.json();
  });
};

export const getData = (token: string, url: string): Promise<ApiResponse> => {
  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
      token,
    },
  }).then((res) => {
    return res.json();
  });
};

export const linesStrToArr = (linesStr: string): string[] => {
  return linesStr
    .split("\n")
    .filter((id) => !!id)
    .map((id) => id.trim());
};
