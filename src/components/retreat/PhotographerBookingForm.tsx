"use client";

import { useMemo, useState } from "react";
import type { BookingRangeOption } from "@/lib/scheduling/booking-service";

function label(option: BookingRangeOption) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: option.timeZone,
  });
  const end = new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: option.timeZone });
  return `${option.artistName} · ${formatter.format(new Date(option.startAt))}–${end.format(new Date(option.endAt))} · ${option.durationHours} hr`;
}

export function PhotographerBookingForm({ options }: { options: BookingRangeOption[] }) {
  const [selected, setSelected] = useState("0");
  const [state, setState] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const option = useMemo(() => options[Number(selected)], [options, selected]);

  async function submit() {
    if (!option || state === "submitting") return;
    setState("submitting");
    setMessage("");
    const response = await fetch("/api/scheduling/bookings", {
      method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        artistId: option.artistId, endAt: option.endAt, eventId: option.eventId,
        idempotencyKey: crypto.randomUUID(), startAt: option.startAt,
      }),
    });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      setState("error");
      setMessage(result?.error || "The booking could not be confirmed.");
      return;
    }
    setState("success");
    setMessage("Reservation confirmed and protected on both participant schedules.");
  }

  if (!options.length) return <p className="account-empty-state">No bookable artist ranges are currently available for your approved retreat.</p>;
  return <div className="account-booking-form">
    <label htmlFor="booking-range">Available creative window</label>
    <select id="booking-range" value={selected} onChange={(event) => { setSelected(event.target.value); setState("idle"); setMessage(""); }}>
      {options.map((item, index) => <option key={`${item.artistId}-${item.startAt}-${item.endAt}`} value={index}>{label(item)}</option>)}
    </select>
    <div className="account-booking-review">
      <span>Instant confirmation</span>
      <strong>{option.artistName}</strong>
      <p>{option.eventTitle} · {option.durationHours} {option.durationHours === 1 ? "hour" : "hours"}</p>
    </div>
    <button className="button button-primary" disabled={state === "submitting" || state === "success"} onClick={submit} type="button">
      {state === "submitting" ? "Protecting your time…" : state === "success" ? "Reservation Confirmed" : "Confirm Reservation"}
    </button>
    {message && <p className={state === "error" ? "account-form-error" : "account-form-success-message"} role="status">{message}</p>}
    {state === "success" && <a className="account-secondary-link" href="/account/my-schedule">Open My Retreat Schedule</a>}
  </div>;
}
