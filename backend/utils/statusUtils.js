export const normalizeStatusKey = (value) =>
  (value || "").replace(/\s+/g, "").toLowerCase();

export const normalizeStatusValue = (value) => {
  const key = normalizeStatusKey(value);

  if (!key || key === "notstarted" || key === "neversubmitted") {
    return "Never Submitted";
  }

  if (key === "pending") {
    return "Pending";
  }

  if (key === "approved") {
    return "Approved";
  }

  if (key === "rejected") {
    return "Rejected";
  }

  return value;
};
