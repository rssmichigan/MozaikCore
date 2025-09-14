"use client";
import { useState, FormEvent } from "react";

export default function Page() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMsg("");
    const r = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    if (r.ok) {
      // auto sign-in happens in our SignupForm normally; here we just redirect
      window.location.href = "/login";
    } else {
      const j = await r.json().catch(() => ({} as any));
      setMsg(j.error ?? "Unable to sign up");
    }
  }

  return (
    <main className="p-6 max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Sign up</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input className="w-full border p-2 rounded" placeholder="Name"
               value={name} onChange={e=>setName(e.target.value)} />
        <input className="w-full border p-2 rounded" placeholder="Email"
               value={email} onChange={e=>setEmail(e.target.value)} />
        <input className="w-full border p-2 rounded" type="password" placeholder="Password"
               value={password} onChange={e=>setPassword(e.target.value)} />
        {msg && <p className="text-red-600 text-sm">{msg}</p>}
        <button className="w-full p-2 rounded bg-black text-white">Create account</button>
      </form>
    </main>
  );
}