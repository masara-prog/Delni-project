// A private trip's "customer_requirements" holds the tourist's own words and the admin's notes together
// ("need - need - ملاحظات الإدارة: note"). Older requests also carried the stations as JSON in the admin notes;
// that data is never shown as text.
export function splitTripNotes(raw: unknown): { customerNeeds: string[]; adminNotes: string[] } {
  const text = String(raw || "").replace(/ملاحظات الإدارة:\s*[[{][\s\S]*[\]}]/g, " ");
  const looksLikeData = (x: string) => /^[[{]|[\]}]$|"\s*:|\{"/.test(x);
  const parts = Array.from(
    new Set(text.split(/\s+-\s+/).map((x) => x.trim()).filter((x) => x && !looksLikeData(x))),
  );
  const isAdmin = (x: string) => x.startsWith("ملاحظات الإدارة");
  return {
    customerNeeds: parts.filter((x) => !isAdmin(x)),
    adminNotes: parts
      .filter(isAdmin)
      .map((x) => x.replace(/^ملاحظات الإدارة:?\s*/, ""))
      .filter(Boolean),
  };
}
