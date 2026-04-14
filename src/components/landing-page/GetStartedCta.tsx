"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

function classNames(...classes: Array<string | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function GetStartedCta({
  variant = "solid",
  className,
  onOpen,
}: {
  variant?: "solid" | "outline";
  className?: string;
  onOpen?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const buttonClass = classNames(
    "inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition",
    variant === "outline"
      ? "border border-[#656D3F]/15 bg-white text-[#1A1A1A] hover:border-[#84934A] hover:text-[#656D3F]"
      : "bg-[#84934A] text-white shadow-lg shadow-[#84934A]/20 hover:bg-[#656D3F]",
    className
  );

  const openModal = () => {
    setOpen(true);
    onOpen?.();
  };

  const navigate = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <>
      <button type="button" className={buttonClass} onClick={openModal}>
        Get Started Free
      </button>

      {open &&
        createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-[28px] bg-white p-6 shadow-[0_35px_90px_rgba(17,24,39,0.18)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-[#656D3F]">
              Start with TeamSync
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-[#1A1A1A]">
              Log in or create a new workspace.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#5E5E5E]">
              Choose how you want to join TeamSync and begin organizing your team.
            </p>
          </div>

          <button
            type="button"
            className="rounded-full border border-[#E2E2DC] bg-[#F8F7F2] px-3 py-2 text-sm font-semibold text-[#656D3F]"
            onClick={() => setOpen(false)}
          >
            Close
          </button>
        </div>

        <div className="mt-8 grid gap-3">
          <button
            type="button"
            className="w-full rounded-full bg-[#1A1A1A] px-4 py-3 text-sm font-semibold text-white"
            onClick={() => navigate("/login")}
          >
            Login
          </button>

          <button
            type="button"
            className="w-full rounded-full border border-[#84934A] bg-white px-4 py-3 text-sm font-semibold text-[#1A1A1A]"
            onClick={() => navigate("/sign-up")}
          >
            Sign Up
          </button>
        </div>
      </div>
    </div>,
    document.body
  )}
    </>
  );
}
