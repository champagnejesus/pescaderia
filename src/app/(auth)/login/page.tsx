"use client";

import { signIn } from "next-auth/react";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Fish, Loader2, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      username: form.get("username"),
      password: form.get("password"),
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Usuario o contraseña incorrectos");
      usernameRef.current?.focus();
    } else {
      router.push("/");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-[#121212]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-[28px] bg-[#5E5CE6] shadow-lg shadow-[#5E5CE6]/20">
            <Fish className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Pescadería</h1>
          <p className="text-sm text-zinc-500">Iniciá sesión para continuar</p>
        </div>
        <div className="bg-zinc-900 rounded-[32px] p-6 space-y-5 border border-zinc-800">
          {error && (
            <div className="rounded-2xl bg-[#FF453A]/15 px-4 py-3 text-sm text-[#FF453A] text-center font-medium">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="username" className="text-sm font-medium text-zinc-400">Usuario</label>
              <Input
                ref={usernameRef}
                id="username"
                name="username"
                type="text"
                required
                autoFocus
                placeholder="Tu usuario"
                disabled={loading}
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-zinc-400">Contraseña</label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Tu contraseña"
                  disabled={loading}
                  className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              type="submit"
              size="pill"
              className="w-full bg-[#5E5CE6] hover:bg-[#5E5CE6]/80 text-white"
              disabled={loading}
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? "Ingresando..." : "Ingresar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
