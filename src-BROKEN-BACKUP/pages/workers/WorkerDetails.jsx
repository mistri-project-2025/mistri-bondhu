export default function WorkerDetails({ worker }) {
  return (
    <div style={{ padding: 16 }}>
      <h2>{worker.name}</h2>
      <p>Category: {worker.category}</p>
      <p>Experience: {worker.experience} yrs</p>
      <p>Phone: {worker.phone}</p>
    </div>
  );
}
