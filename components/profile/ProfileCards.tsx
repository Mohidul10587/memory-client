"use client";

import Link from "next/link";
import Image from "next/image";
import { Phone, X, PhoneCall, Copy, Check } from "lucide-react";
import { useState } from "react";

// ─── WhatsApp SVG Icon ────────────────────────────────────────────────────────
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}
import { BloodGroup } from "@/lib/types";

// ─── Fallback (initials) ──────────────────────────────────────────────────────

function AvatarFallback({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const colors = [
    "from-blue-400 to-blue-600",
    "from-indigo-400 to-indigo-600",
    "from-green-400 to-green-600",
    "from-teal-400 to-teal-600",
    "from-purple-400 to-purple-600",
    "from-pink-400 to-pink-600",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];

  return (
    <div
      className={`w-full h-full flex items-center justify-center bg-linear-to-br ${color}`}
    >
      <span className="text-white font-bold text-3xl select-none">
        {initials}
      </span>
    </div>
  );
}

// ─── Phone Popup ──────────────────────────────────────────────────────────────

function PhonePopup({
  phone,
  onClose,
}: {
  phone: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const normalized = phone.replace(/[\s\-]/g, "");
  const waNumber = normalized.startsWith("+")
    ? normalized.slice(1)
    : normalized.startsWith("0")
    ? "88" + normalized
    : normalized;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(phone);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const el = document.createElement("textarea");
      el.value = phone;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 bg-white rounded-2xl shadow-xl p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-gray-700">যোগাযোগ করুন</p>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="বন্ধ করুন"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Phone number + copy */}
        <div className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 mb-5">
          <p className="text-sm font-medium text-gray-800 tracking-wide">
            {phone}
          </p>
          <button
            onClick={handleCopy}
            className="ml-2 text-gray-400 hover:text-gray-700 transition-colors shrink-0"
            aria-label="নম্বর কপি করুন"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3">
          <a
            href={`tel:${normalized}`}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            <PhoneCall className="h-4 w-4" />
            কল করুন
          </a>
          <a
            href={`https://wa.me/${waNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5d] text-white text-sm font-medium py-2.5 rounded-xl transition-colors"
          >
            <WhatsAppIcon className="h-4 w-4" />
            WhatsApp
          </a>
        </div>
      </div>
    </>
  );
}

// ─── Shared Card Shell ────────────────────────────────────────────────────────

function PersonCard({
  userId,
  name,
  profileImage,
  phone,
  accentColor,
}: {
  userId: string;
  name: string;
  profileImage?: string | null;
  phone?: string;
  accentColor: "blue" | "green";
}) {
  const [showPhonePopup, setShowPhonePopup] = useState(false);

  const linkColor =
    accentColor === "blue"
      ? "text-blue-600 hover:text-blue-700"
      : "text-green-600 hover:text-green-700";

  return (
    <>
      <div className="group rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden flex flex-col hover:shadow-md hover:border-gray-200 transition-all duration-200">
        {/* Photo — wrapped in Link */}
        <Link href={`/profile/${userId}`} className="block">
          <div className="relative w-full aspect-4/5 bg-gray-100 shrink-0">
            {profileImage ? (
              <Image
                src={profileImage}
                alt={name}
                fill
                className="object-cover object-top group-hover:scale-[1.02] transition-transform duration-300"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
            ) : (
              <AvatarFallback name={name} />
            )}
          </div>
        </Link>

        {/* Name + info */}
        <div className="px-3 py-3 flex flex-col gap-1">
          <p className="font-semibold text-gray-900 text-sm leading-snug line-clamp-1">
            {name}
          </p>

          {/* Phone — clickable, opens popup */}
          {phone && (
            <button
              type="button"
              onClick={() => setShowPhonePopup(true)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors w-fit"
            >
              <Phone className="h-3 w-3 shrink-0" />
              <span>{phone}</span>
            </button>
          )}

          {/* Profile link — stays at bottom, full width */}
          <Link
            href={`/profile/${userId}`}
            className={`mt-1 text-xs font-medium ${linkColor}`}
          >
            প্রোফাইল দেখুন →
          </Link>
        </div>
      </div>

      {/* Phone popup */}
      {showPhonePopup && phone && (
        <PhonePopup phone={phone} onClose={() => setShowPhonePopup(false)} />
      )}
    </>
  );
}

// ─── Student Card ─────────────────────────────────────────────────────────────

interface StudentCardProps {
  userId: string;
  name: string;
  profileImage?: string | null;
  sscPassingYear: number;
  profession?: string | null;
  bloodGroup?: BloodGroup | null;
  phone?: string;
}

export function StudentCard({
  userId,
  name,
  profileImage,
  phone,
}: StudentCardProps) {
  return (
    <PersonCard
      userId={userId}
      name={name}
      profileImage={profileImage}
      phone={phone}
      accentColor="blue"
    />
  );
}

// ─── Teacher Card ─────────────────────────────────────────────────────────────

interface TeacherCardProps {
  userId: string;
  name: string;
  profileImage?: string | null;
  designation: string;
  subject: string;
  joiningYear: number;
  bloodGroup?: BloodGroup | null;
}

export function TeacherCard({ userId, name, profileImage }: TeacherCardProps) {
  return (
    <PersonCard
      userId={userId}
      name={name}
      profileImage={profileImage}
      accentColor="green"
    />
  );
}
