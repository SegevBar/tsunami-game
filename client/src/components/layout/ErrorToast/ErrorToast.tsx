import './ErrorToast.scss';

interface ErrorToastProps {
  message: string | null;
}

export function ErrorToast({ message }: ErrorToastProps) {
  if (!message) return null;

  return <div className="error-toast">{message}</div>;
}

