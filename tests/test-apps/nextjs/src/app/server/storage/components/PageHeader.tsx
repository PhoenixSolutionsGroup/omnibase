import Link from "next/link";

export function PageHeader() {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="max-w-5xl mx-auto px-6 py-4">
        <Link
          href="/"
          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </header>
  );
}
