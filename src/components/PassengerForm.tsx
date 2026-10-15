"use client";

import { useState, type ReactNode } from "react";
import {
  getBornOnRange,
  getPassengerTypeLabel,
  type ContactFormValues,
  type FormErrors,
  type PassengerFormValues,
  type TravelDates,
} from "@/features/client/flights/passengers.validation";
import {
  getCountryOptions,
  getTitleForGender,
  getTitleOptions,
} from "@/features/client/flights/passengers.utils";

interface PassengerFormProps {
  contact: ContactFormValues;
  onContactChange: (patch: Partial<ContactFormValues>) => void;
  passengers: PassengerFormValues[];
  onPassengerChange: (index: number, patch: Partial<PassengerFormValues>) => void;
  identityRequired: boolean;
  dates: TravelDates;
  errors: FormErrors;
  showAll: boolean;
}

const inputClass = (invalid: boolean) =>
  `w-full bg-offwhite border rounded-xl px-4 py-3 outline-none focus:ring-2 transition-all ${
    invalid ? "border-red-300 focus:ring-red-300" : "border-line focus:ring-indigo"
  }`;

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <div data-error={error ? "true" : undefined}>
      <label className="block text-xs font-semibold text-mist uppercase tracking-wider mb-2">{label}</label>
      {children}
      {error ? (
        <p className="text-xs text-red-500 mt-1.5">{error}</p>
      ) : hint ? (
        <p className="text-[11px] text-mist mt-1.5">{hint}</p>
      ) : null}
    </div>
  );
}

export default function PassengerForm({
  contact,
  onContactChange,
  passengers,
  onPassengerChange,
  identityRequired,
  dates,
  errors,
  showAll,
}: PassengerFormProps) {
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const countries = getCountryOptions();

  const touch = (key: string) => setTouched((prev) => (prev.has(key) ? prev : new Set(prev).add(key)));
  const err = (key: string) => (showAll || touched.has(key) ? errors[key] : undefined);

  return (
    <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-line">
      <h2 className="text-xl font-bold mb-1">Passenger Details</h2>
      <p className="text-xs text-mist mb-6">
        Enter names exactly as they appear on each traveler&apos;s passport or ID. Name changes after booking can be costly.
      </p>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Contact Email" error={err("email")}>
            <input
              type="email"
              autoComplete="email"
              value={contact.email}
              onChange={(e) => onContactChange({ email: e.target.value })}
              onBlur={() => touch("email")}
              className={inputClass(Boolean(err("email")))}
              placeholder="you@example.com"
            />
          </Field>
          <Field label="Phone Number" error={err("phone")} hint="Include your country code">
            <input
              type="tel"
              autoComplete="tel"
              value={contact.phone}
              onChange={(e) => onContactChange({ phone: e.target.value })}
              onBlur={() => touch("phone")}
              className={inputClass(Boolean(err("phone")))}
              placeholder="+234 801 234 5678"
            />
          </Field>
        </div>

        {passengers.map((p, i) => {
          const key = `passengers.${i}`;
          const range = getBornOnRange(p.type, dates);
          const titles = getTitleOptions(p.gender);

          return (
            <div key={p.id} className="space-y-4 pt-6 border-t border-line">
              <h3 className="font-semibold text-indigo">
                Passenger {i + 1} · {getPassengerTypeLabel(p.type)}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="First Name" error={err(`${key}.givenName`)}>
                  <input
                    type="text"
                    autoComplete="off"
                    value={p.givenName}
                    onChange={(e) => onPassengerChange(i, { givenName: e.target.value })}
                    onBlur={() => touch(`${key}.givenName`)}
                    className={inputClass(Boolean(err(`${key}.givenName`)))}
                  />
                </Field>
                <Field label="Last Name" error={err(`${key}.familyName`)}>
                  <input
                    type="text"
                    autoComplete="off"
                    value={p.familyName}
                    onChange={(e) => onPassengerChange(i, { familyName: e.target.value })}
                    onBlur={() => touch(`${key}.familyName`)}
                    className={inputClass(Boolean(err(`${key}.familyName`)))}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Gender" error={err(`${key}.gender`)}>
                  <select
                    value={p.gender}
                    onChange={(e) =>
                      onPassengerChange(i, {
                        gender: e.target.value,
                        title: getTitleForGender(e.target.value, p.title),
                      })
                    }
                    onBlur={() => touch(`${key}.gender`)}
                    className={inputClass(Boolean(err(`${key}.gender`)))}
                  >
                    <option value="">Select</option>
                    <option value="m">Male</option>
                    <option value="f">Female</option>
                  </select>
                </Field>
                <Field label="Title" error={err(`${key}.title`)}>
                  <select
                    value={p.title}
                    disabled={!p.gender}
                    onChange={(e) => onPassengerChange(i, { title: e.target.value })}
                    onBlur={() => touch(`${key}.title`)}
                    className={`${inputClass(Boolean(err(`${key}.title`)))} disabled:opacity-60`}
                  >
                    <option value="">{p.gender ? "Select" : "Pick gender first"}</option>
                    {titles.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Date of Birth" error={err(`${key}.bornOn`)}>
                  <input
                    type="date"
                    min={range.min}
                    max={range.max}
                    value={p.bornOn}
                    onChange={(e) => onPassengerChange(i, { bornOn: e.target.value })}
                    onBlur={() => touch(`${key}.bornOn`)}
                    className={inputClass(Boolean(err(`${key}.bornOn`)))}
                  />
                </Field>
              </div>

              {identityRequired && (
                <div className="rounded-2xl bg-offwhite p-4 space-y-4">
                  <p className="text-xs text-mist">This airline requires passport details for every traveler.</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Field label="Passport Number" error={err(`${key}.passport.number`)}>
                      <input
                        type="text"
                        autoComplete="off"
                        value={p.passport.number}
                        onChange={(e) =>
                          onPassengerChange(i, { passport: { ...p.passport, number: e.target.value.toUpperCase() } })
                        }
                        onBlur={() => touch(`${key}.passport.number`)}
                        className={inputClass(Boolean(err(`${key}.passport.number`)))}
                      />
                    </Field>
                    <Field label="Issuing Country" error={err(`${key}.passport.countryCode`)}>
                      <select
                        value={p.passport.countryCode}
                        onChange={(e) => onPassengerChange(i, { passport: { ...p.passport, countryCode: e.target.value } })}
                        onBlur={() => touch(`${key}.passport.countryCode`)}
                        className={inputClass(Boolean(err(`${key}.passport.countryCode`)))}
                      >
                        <option value="">Select</option>
                        {countries.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                    <Field label="Expiry Date" error={err(`${key}.passport.expiresOn`)}>
                      <input
                        type="date"
                        min={dates.last}
                        value={p.passport.expiresOn}
                        onChange={(e) => onPassengerChange(i, { passport: { ...p.passport, expiresOn: e.target.value } })}
                        onBlur={() => touch(`${key}.passport.expiresOn`)}
                        className={inputClass(Boolean(err(`${key}.passport.expiresOn`)))}
                      />
                    </Field>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}