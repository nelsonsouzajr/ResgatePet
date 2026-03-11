interface FormHintProps {
  message?: string;
}

export function FormHint({ message }: FormHintProps) {
  if (!message) return null;
  return <p className="mt-1 text-xs font-semibold text-rose-600">{message}</p>;
}
