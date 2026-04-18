/**
 * adminLeads.js
 * -----------------------------
 * Admin → Provider leads
 * 5 worker = 1 group
 */

export function sendLeadsToWorkers(provider, workers = []) {
  if (!provider || !workers.length) return;

  const existing =
    JSON.parse(localStorage.getItem("mb_worker_leads")) || [];

  const now = new Date().toISOString();

  const newLeads = workers.map((w) => ({
    id: Date.now().toString() + Math.random(),
    workerId: w.id,
    workerName: w.name,
    providerId: provider.phone,
    providerName: provider.name,
    providerPhone: provider.phone,
    contactedAt: now,
    source: "ADMIN_LEAD",
  }));

  localStorage.setItem(
    "mb_worker_leads",
    JSON.stringify([...existing, ...newLeads])
  );
}
