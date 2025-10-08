interface StatusMessagesProps {
  error: string;
  success: string;
}

export function StatusMessages({ error, success }: StatusMessagesProps) {
  if (!error && !success) return null;

  return (
    <>
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      {success && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-800">{success}</p>
        </div>
      )}
    </>
  );
}
