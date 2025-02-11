import dayjs from "@dayjs";

export function parseDate(date_str: string) {
  const [month, year] = date_str.split("-");
  const date = dayjs(`${year}-${month}-01`, "YYYY-MM-DD");
  return date.add(date.daysInMonth() - 1, "day");
}
