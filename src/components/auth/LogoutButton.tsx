"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/admin-login");
    router.refresh();
  }

  return (
    <button
      onClick={logout}
      className="rounded-xl border px-5 py-3"
    >
      Logout
    </button>
  );
}
