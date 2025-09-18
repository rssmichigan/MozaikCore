export default async function Page(){
  return (
    <main className="p-6 space-y-2">
      <h1 className="text-2xl font-semibold">Health</h1>
      <ul className="list-disc pl-6">
        <li><a className="underline" href="/api/heartbeat">/api/heartbeat</a></li>
        <li><a className="underline" href="/api/usage">/api/usage</a></li>
      </ul>
    </main>
  )
}
