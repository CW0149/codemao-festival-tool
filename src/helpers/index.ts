import { ApiResponse, ClassData } from "../constants/types";

export const postFestivalData = (
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

export const getFestivalData = (
  token: string,
  url: string
): Promise<ApiResponse> => {
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

export const postCrmData = (url: string, data: Record<string, any>) => {
  return fetch(url, {
    method: "POST",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
    },
    body: JSON.stringify(data),
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

export const classDataToClassInfo = (classData: ClassData) => {
  const { package_name, term_name, class_name } = classData;

  return package_name + term_name + class_name;
};
