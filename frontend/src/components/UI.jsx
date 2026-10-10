export function Card({ children, className = "" }) {
  return <div className={`card ${className}`}>{children}</div>;
}
export function Button({ children, variant = "primary", ...p }) {
  return (
    <button className={`btn ${variant}`} {...p}>
      {children}
    </button>
  );
}
export function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <h3>{title}</h3>
          <button onClick={onClose}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
export function Status({ value }) {
  return (
    <span className={`status ${String(value).replaceAll("_", "-")}`}>
      {String(value).replaceAll("_", " ")}
    </span>
  );
}
export function Empty({ text = "No data found" }) {
  return <div className="empty">{text}</div>;
}
