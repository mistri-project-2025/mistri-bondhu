// ProviderStatus.jsx
import { useEffect, useState } from "react";
import { getWorkerStatus } from "../../firebase/search";

export default function ProviderStatus({ workerId }) {
  const [status, setStatus] = useState("loading...");

  useEffect(() => {
    if (!workerId) return;

    const loadStatus = async () => {
      try {
        const s = await getWorkerStatus(workerId);
        setStatus(s); // "approved" / "pending" / "inactive"
      } catch {
        setStatus("error");
      }
    };

    loadStatus();
  }, [workerId]);

  return <p>Status: {status}</p>;
}
