// ProviderProfile.jsx
import { useEffect, useState } from "react";
import { getWorkerProfile } from "../../firebase/search";

export default function ProviderProfile({ workerId }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!workerId) return;

    const loadProfile = async () => {
      try {
        const p = await getWorkerProfile(workerId);
        setProfile(p);
      } catch {
        setProfile(null);
      }
    };

    loadProfile();
  }, [workerId]);

  if (!profile) return <p>Profile not available</p>;

  return (
    <div style={{ background: "#fefefe", padding: 12, borderRadius: 6 }}>
      <b>{profile.name}</b>
      <p>📞 {profile.phone}</p>
      <p>🛠 {profile.categoryName}</p>
      <p>📍 {profile.pincode}</p>
      <p>Experience: {profile.experience} years</p>
      <p>Status: {profile.approval}</p>
    </div>
  );
}
