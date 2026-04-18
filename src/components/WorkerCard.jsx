export default function WorkerCard({
  worker,
  selectable,
  selected,
  onSelect,
}) {
  return (
    <div className={`worker-card ${selected ? "selected" : ""}`}>
      <h4>{worker.name}</h4>
      <p>Category: {worker.categoryId}</p>
      <p>PIN: {worker.pincode}</p>

      <div className="actions">
        <a href={`tel:${worker.phone}`}>📞 Call</a>
        <a
          href={`https://wa.me/91${worker.phone}`}
          target="_blank"
          rel="noreferrer"
        >
          💬 WhatsApp
        </a>

        {selectable && (
          <button onClick={onSelect}>
            {selected ? "Unselect" : "Select"}
          </button>
        )}
      </div>
    </div>
  );
}
