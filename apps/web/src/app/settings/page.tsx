'use client'
import { useEffect, useState } from 'react'

export default function Settings() {
  const [apiUrl, setApiUrl] = useState<string>('')

  useEffect(() => {
    setApiUrl(process.env.NEXT_PUBLIC_API_URL || '')
  }, [])

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Settings</h1>
      <div className="space-y-2">
        <label className="block text-sm font-medium">API URL</label>
        <input className="border p-2 w-full" value={apiUrl} readOnly />
        <p className="text-xs text-gray-500">
          From <code>.env.local</code>. Edit and restart dev server to change.
        </p>
      </div>
      <InstallHint />
    </main>
  )
}

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<unknown>
}

function InstallHint() {
  const [supported, setSupported] = useState(false)
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      // best-effort narrow
      const bip = e as BeforeInstallPromptEvent
      e.preventDefault?.()
      setDeferred(bip)
      setSupported(true)
    }
    window.addEventListener('beforeinstallprompt', handler, { passive: false })
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener)
  }, [])

  const onInstall = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    setDeferred(null)
  }

  return (
    <div className="mt-6">
      <h2 className="font-semibold mb-2">Install</h2>
      {supported ? (
        <button onClick={onInstall} className="border px-4 py-2">Install as App</button>
      ) : (
        <p className="text-sm text-gray-500">Open in Chrome/Edge and look for “Install app”.</p>
      )}
    </div>
  )
}
