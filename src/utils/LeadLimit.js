export const DAILY_LIMIT = 5;
export const MONTHLY_LIMIT = 50;

export function checkProviderLeadLimit(providerId) {
  const leads = JSON.parse(
    localStorage.getItem("mb_worker_leads") || "[]"
  );

  const now = new Date();

  const todayCount = leads.filter((l) => {
    const d = new Date(l.contactedAt);
    return (
      l.providerId === providerId &&
      d.toDateString() === now.toDateString()
    );
  }).length;

  const monthCount = leads.filter((l) => {
    const d = new Date(l.contactedAt);
    return (
      l.providerId === providerId &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }).length;

  return {
    todayCount,
    monthCount,
    canContact:
      todayCount < DAILY_LIMIT &&
      monthCount < MONTHLY_LIMIT,
  };
}
