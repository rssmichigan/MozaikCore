'use client'
export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  return (
    <html>
      <body className="max-w-3xl mx-auto p-6 space-y-3">
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-gray-600">Please try again. {error?.message}</p>
      </body>
    </html>
  );
}
