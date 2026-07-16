export const RANK_COLORS = {
  E: "#8a93a6",
  D: "#3ddc97",
  C: "#00e5ff",
  B: "#7c5cff",
  A: "#ffb238",
  S: "#ff5470",
};

export const CATEGORY_COLORS = {
  Food: "#ffb238",
  Transport: "#00e5ff",
  Entertainment: "#7c5cff",
  Bills: "#ff5470",
  Shopping: "#3ddc97",
  Health: "#5b9cff",
  Other: "#8a93a6",
};

export const CATEGORIES = ["Food", "Transport", "Entertainment", "Bills", "Shopping", "Health", "Other"];

export function formatCurrency(amount) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(amount || 0);
}
