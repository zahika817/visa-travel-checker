"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("ChangeThisPassword123!");
  const [error, setError] = useState("");

  async function login() {
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!data.success) {
      setError(data.error);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-zinc-50 p-8 text-zinc-900">

      <div className="mx-auto max-w-md">

        <h1 className="text-3xl font-bold">
          Admin Login
        </h1>

        <div className="mt-8 space-y-4 rounded-2xl border bg-white p-6">

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full rounded-xl border p-3"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-xl border p-3"
          />

          <button
            onClick={login}
            className="w-full rounded-xl bg-black px-5 py-3 text-white"
          >
            Login
          </button>

          {error && (
            <p className="text-red-600">
              {error}
            </p>
          )}

        </div>

      </div>

    </main>
  );
}
