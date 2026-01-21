"use client";

import { signIn } from "next-auth/react";

export function SignInButton({
  disabled,
  callbackUrl = "/app",
  className,
  children = "Sign in with GitHub",
}: {
  disabled?: boolean;
  callbackUrl?: string;
  className?: string;
  children?: string;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => signIn("github", { callbackUrl })}
      className={className}
    >
      {children}
    </button>
  );
}

