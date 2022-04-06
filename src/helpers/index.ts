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

export const getCrmData = (url: string) => {
  return fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/plain, */*",
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

export const classDataToClassInfo = (classData: ClassData) => {
  const { package_name, term_name, class_name } = classData;

  return package_name + term_name + class_name;
};

export type Order = "asc" | "desc";
export function getComparator<Key extends keyof any>(
  order: Order,
  orderBy: Key
): (
  a: { [key in Key]: number | string },
  b: { [key in Key]: number | string }
) => number {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

export function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}
