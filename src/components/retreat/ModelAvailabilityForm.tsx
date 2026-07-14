"use client";

import { useMemo, useState } from "react";
import type { ModelAvailabilityDay } from "@/lib/scheduling/availability-service";

type Block = ModelAvailabilityDay["blockedTimes"][number];

export function ModelAvailabilityForm({ days }: { days: ModelAvailabilityDay[] }) {
  const [selected, setSelected] = useState(0);
  const day = days[selected];
  const [from, setFrom] = useState(day?.availableFrom || "06:00");
  const [until, setUntil] = useState(day?.availableUntil || "18:00");
  const [blocks, setBlocks] = useState<Block[]>(day?.blockedTimes || []);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const dateLabel = useMemo(() => day ? new Intl.DateTimeFormat("en-US", {
    weekday: "long", month: "long", day: "numeric", timeZone: "UTC",
  }).format(new Date(`${day.date}T12:00:00Z`)) : "", [day]);

  function choose(index: number) {
    const next = days[index];
    setSelected(index); setFrom(next.availableFrom); setUntil(next.availableUntil); setBlocks(next.blockedTimes); setMessage("");
  }
  function updateBlock(index: number, patch: Partial<Block>) {
    setBlocks((current) => current.map((block, position) => position === index ? { ...block, ...patch } : block));
  }
  async function save() {
    setSaving(true); setMessage("");
    const response = await fetch("/api/scheduling/availability", {
      method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ availableFrom: from, availableUntil: until, blockedTimes: blocks, date: day.date, eventId: day.eventId }),
    });
    const result = await response.json().catch(() => null);
    setSaving(false);
    setMessage(response.ok ? "Availability saved. Confirmed reservations remain protected." : result?.error || "Availability could not be saved.");
  }
  if (!day) return <p className="account-empty-state">No eligible retreat days are connected to this model profile.</p>;
  return <div className="account-availability-form">
    <label htmlFor="availability-day">Retreat day</label>
    <select id="availability-day" value={selected} onChange={(event) => choose(Number(event.target.value))}>
      {days.map((item, index) => <option key={`${item.eventId}-${item.date}`} value={index}>{item.eventTitle} · {item.date}</option>)}
    </select>
    <p className="account-day-heading">{dateLabel} <small>{day.timeZone}</small></p>
    <div className="account-time-fields">
      <label>Available from<input type="time" step="3600" value={from} onChange={(event) => setFrom(event.target.value)} /></label>
      <label>Available until<input type="time" step="3600" value={until} onChange={(event) => setUntil(event.target.value)} /></label>
    </div>
    <div className="account-block-list">
      <div><strong>Unavailable blocks</strong><button type="button" onClick={() => setBlocks((current) => [...current, { startTime: "12:00", endTime: "13:00", reason: "lunch" }])}>+ Add block</button></div>
      {blocks.map((block, index) => <fieldset key={index}>
        <legend>Block {index + 1}</legend>
        <input aria-label={`Block ${index + 1} start`} type="time" step="3600" value={block.startTime} onChange={(event) => updateBlock(index, { startTime: event.target.value })} />
        <input aria-label={`Block ${index + 1} end`} type="time" step="3600" value={block.endTime} onChange={(event) => updateBlock(index, { endTime: event.target.value })} />
        <select aria-label={`Block ${index + 1} reason`} value={block.reason} onChange={(event) => updateBlock(index, { reason: event.target.value as Block["reason"] })}>
          <option value="lunch">Lunch</option><option value="unavailable">Unavailable</option><option value="other">Other</option>
        </select>
        <button aria-label={`Remove block ${index + 1}`} type="button" onClick={() => setBlocks((current) => current.filter((_, position) => position !== index))}>Remove</button>
      </fieldset>)}
    </div>
    <button className="button button-primary" disabled={saving} onClick={save} type="button">{saving ? "Protecting schedule…" : "Save Availability"}</button>
    {message && <p role="status">{message}</p>}
  </div>;
}
