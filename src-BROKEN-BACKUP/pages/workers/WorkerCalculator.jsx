import { useState } from "react";

export default function WorkerCalculator() {
  const [hours, setHours] = useState(0);
  const [rate, setRate] = useState(0);

  const total = hours * rate;

  return (
    <div style={{ padding: 16 }}>
      <h3>Worker Payment Calculator</h3>
      <input type="number" placeholder="Hours" value={hours} onChange={(e) => setHours(+e.target.value)} />
      <input type="number" placeholder="Rate/hr" value={rate} onChange={(e) => setRate(+e.target.value)} />
      <p>Total: {total}</p>
    </div>
  );
}
