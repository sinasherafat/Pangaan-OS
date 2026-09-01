export function StatusBadge({ value }: { value: string }) {
  return <span className={`badge ${value.toLowerCase().replaceAll(" ","-")}`}>{value}</span>;
}

