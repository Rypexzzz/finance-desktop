export function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="card">
      <h2>{title}</h2>
      <p className="muted">
        Этот раздел будет добавлен после завершения базового модуля “Операции”.
      </p>
    </div>
  );
}