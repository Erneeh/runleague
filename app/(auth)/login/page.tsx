import { Suspense } from "react";
import { LoginForm } from "./login-form";

function LoginFallback() {
  return (
    <div className="mx-auto mt-12 max-w-md">
      <div className="rounded-2xl border border-blue-100 bg-white p-8 shadow-sm shadow-blue-100 animate-pulse">
        <div className="mb-6 h-7 w-48 rounded bg-blue-100" />
        <div className="space-y-4">
          <div className="h-10 rounded-xl bg-blue-50" />
          <div className="h-10 rounded-xl bg-blue-50" />
          <div className="h-10 rounded-xl bg-blue-600/80" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginForm />
    </Suspense>
  );
}
