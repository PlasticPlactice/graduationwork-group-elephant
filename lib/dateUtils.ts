export const toDateTimeLocalValue = (iso?: string | Date | null): string => {
  if (!iso) return "";
  const d = (iso instanceof Date) ? new Date(iso) : new Date(iso);
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

export const formatDateTime = (iso?: string | Date | null): string => {
  if (!iso) return "";
  const d = (iso instanceof Date) ? iso : new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("ja-JP", { dateStyle: "medium", timeStyle: "short" });
};

export const toISOStringFromLocal = (localValue?: string | null): string | null => {
  if (!localValue) return null;
  const d = new Date(localValue);
  return isNaN(d.getTime()) ? null : d.toISOString();
};
