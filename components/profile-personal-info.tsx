"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { updateProfileAction } from "@/app/(actions)/profile";
import { CountryFlag } from "@/components/country-flag";
import { COUNTRY_OPTIONS, getDisplayFlag } from "@/lib/countries";
import {
  formatName,
  formatNickname,
  formatPhoneDisplay,
  normalizePhone,
  onlyNameChars,
} from "@/lib/format";

type Props = {
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  nickname: string | null;
  countryCode: string | null;
};

export function ProfilePersonalInfo({
  email,
  firstName: initialFirstName,
  lastName: initialLastName,
  phone: initialPhone,
  nickname: initialNickname,
  countryCode: initialCountryCode,
}: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(initialFirstName ?? "");
  const [lastName, setLastName] = useState(initialLastName ?? "");
  const [phone, setPhone] = useState(initialPhone ?? "");
  const [nickname, setNickname] = useState(initialNickname ?? "");
  const [countryCode, setCountryCode] = useState(initialCountryCode ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setFirstName(initialFirstName ?? "");
    setLastName(initialLastName ?? "");
    setPhone(initialPhone ?? "");
    setNickname(initialNickname ?? "");
    setCountryCode(initialCountryCode ?? "");
  }, [
    initialFirstName,
    initialLastName,
    initialPhone,
    initialNickname,
    initialCountryCode,
  ]);

  const handleSave = async () => {
    setError(null);
    setSaving(true);
    const result = await updateProfileAction({
      first_name: formatName(firstName) || null,
      last_name: formatName(lastName) || null,
      phone: normalizePhone(phone) || null,
      nickname: formatNickname(nickname) || null,
      country_code: countryCode && countryCode !== "OTHER" ? countryCode : null,
    });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEditing(false);
    router.refresh();
  };

  const handleCancel = () => {
    setFirstName(initialFirstName ?? "");
    setLastName(initialLastName ?? "");
    setPhone(initialPhone ?? "");
    setNickname(initialNickname ?? "");
    setCountryCode(initialCountryCode ?? "");
    setError(null);
    setEditing(false);
  };

  const allFieldsFilled =
    formatName(firstName) !== "" &&
    formatName(lastName) !== "" &&
    formatNickname(nickname) !== "" &&
    countryCode !== "";

  const hadAllFieldsFilledInitially =
    formatName(initialFirstName) !== "" &&
    formatName(initialLastName) !== "" &&
    formatNickname(initialNickname) !== "" &&
    (initialCountryCode ?? "").trim() !== "";

  const canSave = allFieldsFilled && !saving;
  const canCancel = hadAllFieldsFilledInitially && !saving;

  const inputClass =
    "w-full rounded-xl border border-blue-200 bg-blue-50/30 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-400 focus:bg-white";

  return (
    <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm shadow-blue-50">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">Personal info</h2>
        {!editing ? (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700 transition-colors hover:bg-blue-100"
          >
            Edit
          </button>
        ) : null}
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {editing ? (
        <div className="space-y-4">
          <p className="text-[11px] font-medium text-slate-500">
            All fields below are required except phone. You can only cancel if you already had every required field filled.
          </p>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Email
            </label>
            <p className="text-sm font-medium text-slate-500">{email ?? "—"}</p>
            <p className="mt-0.5 text-[10px] text-slate-400">Email cannot be changed here.</p>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              First name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(onlyNameChars(e.target.value))}
              className={inputClass}
              placeholder="First name"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Last name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(onlyNameChars(e.target.value))}
              className={inputClass}
              placeholder="Last name"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Nickname <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className={inputClass}
              placeholder="Runner123"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(normalizePhone(e.target.value))}
              className={inputClass}
              placeholder="+370 612 34567"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Country <span className="text-red-500">*</span>
            </label>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              className={inputClass}
              required
            >
              <option value="">— Select country —</option>
              {COUNTRY_OPTIONS.map(({ code, name }) => (
                <option key={code} value={code}>
                  {getDisplayFlag(code) ? `${getDisplayFlag(code)} ${name}` : name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={!canCancel}
              className="rounded-xl border border-blue-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-blue-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Email
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-slate-800">{email ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              First name
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-slate-800">
              {initialFirstName ? formatName(initialFirstName) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Last name
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-slate-800">
              {initialLastName ? formatName(initialLastName) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Nickname
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-slate-800">
              {initialNickname ? formatNickname(initialNickname) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Phone
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-slate-800">
              {initialPhone ? formatPhoneDisplay(initialPhone) : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Country
            </dt>
            <dd className="mt-0.5 flex items-center gap-1.5 text-sm font-medium text-slate-800">
              {initialCountryCode && initialCountryCode !== "OTHER" ? (
                <>
                  <CountryFlag code={initialCountryCode} size="sm" />
                  {COUNTRY_OPTIONS.find((c) => c.code === initialCountryCode)?.name ?? initialCountryCode}
                </>
              ) : (
                "—"
              )}
            </dd>
          </div>
        </dl>
      )}
    </div>
  );
}
