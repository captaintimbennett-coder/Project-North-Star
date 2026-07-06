"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  artistById,
  artistIsAvailable,
  formatHour,
  formatRange,
  prototypeArtists,
  prototypeBookings,
  prototypeCurrentTime,
  prototypeDays,
  prototypeHours,
  type CalendarDayId,
} from "@/data/calendar-prototype";

type PrototypeView = "mine" | "retreat" | "artists" | "availability" | "admin";
type BookingStage = "select" | "review" | "confirmed";

const viewLabels: Record<PrototypeView, string> = {
  mine: "My Schedule",
  retreat: "Retreat Schedule",
  artists: "Schedule a Shoot",
  availability: "Shape Your Day",
  admin: "Master Calendar",
};

function StarMark() {
  return <Image src="/images/brand/north-star-symbol-v1.0.png" alt="" width={40} height={44} />;
}

function DaySelector({ day, onChange }: { day: CalendarDayId; onChange: (day: CalendarDayId) => void }) {
  return <div className="calendar-days" aria-label="Retreat day">
    {prototypeDays.map((item) => <button aria-pressed={day === item.id} key={item.id} onClick={() => onChange(item.id)} type="button"><span>{item.label}</span><strong>{item.date}</strong></button>)}
  </div>;
}

function StatusKey() {
  return <div className="calendar-status-key" aria-label="Schedule status legend">
    <span><i className="is-confirmed" /> Confirmed</span>
    <span><i className="is-available" /> Available</span>
    <span><i className="is-blocked" /> Unavailable</span>
    <span><i className="is-review" /> Admin review</span>
  </div>;
}

function MySchedule({ day }: { day: CalendarDayId }) {
  const bookings = prototypeBookings.filter((booking) => booking.day === day && booking.photographerName === "Tim Bennett");
  const selectedDay = prototypeDays.find((item) => item.id === day)!;
  const nextBooking = bookings.find((booking) => day !== prototypeCurrentTime.day || booking.start > prototypeCurrentTime.hour) || bookings[0];
  return <section className="calendar-view calendar-my-schedule" aria-labelledby="my-schedule-title">
    <div className="calendar-personal-intro">
      <p className="ds-eyebrow">{selectedDay.shortLabel} · Your retreat itinerary</p>
      <h2 id="my-schedule-title">Good morning, Tim.</h2>
      <p>Everything that matters today, quietly in one place.</p>
    </div>
    <div className="calendar-next-session">
      <div><span>Your next creative session</span><h3>You&apos;re creating with<br /><em>{artistById(nextBooking.artistId).name}.</em></h3><p>{formatRange(nextBooking.start, nextBooking.end)} · Confirmed and protected</p></div>
      <aside><span>Begins in</span><strong>{day === prototypeCurrentTime.day ? "34" : "—"}</strong><small>{day === prototypeCurrentTime.day ? "minutes" : selectedDay.date}</small></aside>
    </div>
    <div className="calendar-day-summary" aria-label="Your day summary">
      <p><strong>{bookings.length}</strong><span>Creative sessions</span></p>
      <p><strong>1</strong><span>Open creative window</span></p>
      <p><strong>12:00</strong><span>Lunch · until 1:00 PM</span></p>
    </div>
    <div className="calendar-agenda">
      <div className="calendar-agenda-line" aria-hidden="true" />
      {prototypeHours.map((hour) => {
        const booking = bookings.find((item) => item.start === hour);
        const insideBooking = bookings.some((item) => hour > item.start && hour < item.end);
        const isCurrent = day === prototypeCurrentTime.day && (booking
          ? prototypeCurrentTime.hour >= booking.start && prototypeCurrentTime.hour < booking.end
          : hour === Math.floor(prototypeCurrentTime.hour));
        if (insideBooking) return null;
        return <div className={`calendar-agenda-row${booking ? " has-booking" : ""}`} key={hour}>
          <time>{formatHour(hour)}</time>
          {isCurrent && <span className="calendar-you-are-here">You are here</span>}
          {booking ? <article className="calendar-booking-card"><span>Your creative session</span><h3>Creating with {artistById(booking.artistId).name}</h3><p>{formatRange(booking.start, booking.end)}</p><i aria-hidden="true">Confirmed · Protected</i></article> : hour === 12 ? <p className="calendar-open-time is-lunch">Lunch · Personal time</p> : <p className="calendar-open-time">Open creative window</p>}
        </div>;
      })}
    </div>
  </section>;
}

function RetreatSchedule({ day }: { day: CalendarDayId }) {
  const bookings = prototypeBookings.filter((booking) => booking.day === day);
  return <section className="calendar-view" aria-labelledby="retreat-schedule-title">
    <div className="calendar-view-heading"><div><p className="ds-eyebrow">The retreat in motion</p><h2 id="retreat-schedule-title">Retreat Schedule</h2></div><p>See who is creating now, who is available later, and where the day still holds possibility.</p></div>
    <div className="retreat-timeline" role="table" aria-label="Privacy-safe retreat schedule by artist">
      <div className="retreat-timeline-row retreat-timeline-head" role="row">
        <span role="columnheader">Participating artist</span>
        {prototypeHours.map((hour) => <time role="columnheader" key={hour}>{hour % 12 || 12}</time>)}
      </div>
      {prototypeArtists.map((artist) => {
        const artistBookings = bookings.filter((booking) => booking.artistId === artist.id);
        return <div className="retreat-timeline-row" role="row" key={artist.id}>
          <strong role="rowheader">{artist.name}</strong>
          <div className="retreat-timeline-track">
            {prototypeHours.map((hour) => <i key={hour} />)}
            {artist.availableWindows[day].map((window) => <span className="is-available" aria-label={`${artist.name} available ${formatRange(window.start, window.end)}`} key={`${artist.id}-${window.start}`} style={{ "--timeline-start": window.start - 6, "--timeline-span": window.end - window.start } as React.CSSProperties}><small>Available</small></span>)}
            {artistBookings.map((booking) => <span className={booking.status === "admin-review" ? "is-booked is-review" : "is-booked"} aria-label={`${artist.name}, ${booking.status === "admin-review" ? "admin review" : "confirmed"}, ${formatRange(booking.start, booking.end)}`} key={booking.id} style={{ "--timeline-start": booking.start - 6, "--timeline-span": booking.end - booking.start } as React.CSSProperties}><small>{booking.status === "admin-review" ? "Review" : "Confirmed"}</small><b>{formatRange(booking.start, booking.end)}</b></span>)}
            {day === prototypeCurrentTime.day && <em className="retreat-now-line" aria-label="Current retreat time" style={{ "--timeline-now": prototypeCurrentTime.hour - 6 } as React.CSSProperties}><small>Now</small></em>}
          </div>
        </div>;
      })}
    </div>
    <div className="retreat-mobile-timeline">
      {prototypeArtists.map((artist) => {
        const artistBookings = bookings.filter((booking) => booking.artistId === artist.id);
        return <article key={artist.id}><h3>{artist.name}</h3><p><span>Available</span>{artist.availableWindows[day].map((window) => formatRange(window.start, window.end)).join(" · ")}</p>{artistBookings.map((booking) => {
          const isNow = day === prototypeCurrentTime.day && prototypeCurrentTime.hour >= booking.start && prototypeCurrentTime.hour < booking.end;
          return <p className={booking.status === "admin-review" ? "is-review" : "is-confirmed"} key={booking.id}><span>{isNow ? "Now · Confirmed" : booking.status === "admin-review" ? "Admin review" : "Confirmed"}</span>{formatRange(booking.start, booking.end)}</p>;
        })}</article>;
      })}
    </div>
    <p className="calendar-privacy-note"><span aria-hidden="true">◇</span> Photographer identity and creative details remain private.</p>
  </section>;
}

function TimeSelection({ day, start, end, onSelect }: { day: CalendarDayId; start: number; end: number; onSelect: (start: number, end: number) => void }) {
  const [message, setMessage] = useState("");
  function choose(hour: number) {
    const anyArtist = prototypeArtists.some((artist) => artistIsAvailable(artist, day, hour, hour + 2));
    if (!anyArtist) {
      const alternative = prototypeHours.find((candidate) => prototypeArtists.some((artist) => artistIsAvailable(artist, day, candidate, candidate + 2)));
      setMessage(alternative ? `${formatRange(hour, hour + 2)} is unavailable. The nearest available window begins at ${formatHour(alternative)}.` : "No two-hour artist windows remain on this day.");
      return;
    }
    setMessage("");
    if (hour < start || hour >= end || end - start >= 3) onSelect(hour, hour + 2);
    else onSelect(start, hour + 1);
  }
  return <div className="calendar-time-selection">
    <div className="calendar-time-selection__summary"><span>Selected creative window</span><strong>{formatRange(start, end)}</strong><p>{end - start} hours · Continuous reservation</p></div>
    <div className="calendar-time-ribbon" aria-label="Select a continuous creative window">
      {prototypeHours.slice(0, -1).map((hour) => {
        const selected = hour >= start && hour < end;
        const anyArtist = prototypeArtists.some((artist) => artistIsAvailable(artist, day, hour, hour + 2));
        return <button aria-pressed={selected} className={`${selected ? "is-selected" : ""}${anyArtist ? "" : " is-unavailable"}`} key={hour} onClick={() => choose(hour)} type="button"><span>{formatHour(hour)}</span><i aria-hidden="true" /></button>;
      })}
    </div>
    <p className="calendar-live-message" aria-live="polite">{message}</p>
  </div>;
}

function ArtistSelection({ day }: { day: CalendarDayId }) {
  const [range, setRange] = useState({ start: 13, end: 15 });
  const [artistId, setArtistId] = useState("elena-vale");
  const [stage, setStage] = useState<BookingStage>("select");
  const artist = artistById(artistId);
  const availableArtists = useMemo(() => prototypeArtists.filter((item) => artistIsAvailable(item, day, range.start, range.end)), [day, range]);
  if (stage === "confirmed") return <section className="calendar-confirmed" aria-live="polite"><StarMark /><p className="ds-eyebrow">Prototype confirmation</p><h2>Reservation Confirmed</h2><div><Image src={artist.image} alt={artist.imageAlt} fill sizes="360px" /><span /></div><h3>{artist.name}</h3><p>{prototypeDays.find((item) => item.id === day)?.date}<br />{formatRange(range.start, range.end)} · America/Chicago</p><small>No live booking was created. This is a design prototype.</small><button type="button" onClick={() => setStage("select")}>Return to Artist Selection</button></section>;
  if (stage === "review") return <section className="calendar-view calendar-review" aria-labelledby="booking-review-title"><button className="calendar-back" onClick={() => setStage("select")} type="button">← Back to selection</button><div className="calendar-review-grid"><div className="calendar-review-image"><Image src={artist.image} alt={artist.imageAlt} fill sizes="(max-width: 760px) 100vw, 45vw" /></div><div><p className="ds-eyebrow">Review your creative window</p><h2 id="booking-review-title">Create with<br />{artist.name}.</h2><dl><div><dt>Date</dt><dd>{prototypeDays.find((item) => item.id === day)?.date}</dd></div><div><dt>Time</dt><dd>{formatRange(range.start, range.end)}</dd></div><div><dt>Duration</dt><dd>{range.end - range.start} hours</dd></div><div><dt>Status</dt><dd>Instant confirmation</dd></div></dl><p className="calendar-review-note">By confirming, both participants agree to coordinate privately and uphold the Lone Star Retreat Professional Standards.</p><button className="calendar-primary-action" onClick={() => setStage("confirmed")} type="button">Confirm Prototype Reservation <span>→</span></button><small>This prototype does not save or submit a booking.</small></div></div></section>;
  return <section className="calendar-view calendar-artist-selection" aria-labelledby="artist-selection-title">
    <div className="calendar-view-heading calendar-artist-heading"><div><p className="ds-eyebrow">Who do you want to create with?</p><h2 id="artist-selection-title">Choose your creative window.</h2></div><p>Select one uninterrupted span. Then meet the artists whose day aligns with yours.</p></div>
    <TimeSelection day={day} start={range.start} end={range.end} onSelect={(start, end) => { setRange({ start, end }); setArtistId(""); }} />
    <div className="calendar-available-artists"><div className="calendar-subheading"><span>Artists available for your creative window</span><p>{formatRange(range.start, range.end)}</p></div><div className="calendar-artist-cards">{availableArtists.map((item) => <button aria-pressed={artistId === item.id} key={item.id} onClick={() => setArtistId(item.id)} type="button"><div><Image src={item.image} alt={item.imageAlt} fill sizes="(max-width: 760px) 100vw, 50vw" /><span /></div><p>Available to create with you</p><h3>{item.name}</h3><small>{item.minimumHours}-hour minimum · Your window is a beautiful fit</small><i>{artistId === item.id ? "Creating together" : "Choose this artist"}</i></button>)}</div></div>
    <div className="calendar-selection-footer"><div><span>Selected</span><strong>{artistId ? artist.name : "Choose an artist"}</strong><p>{formatRange(range.start, range.end)}</p></div><button className="calendar-primary-action" disabled={!artistId} onClick={() => setStage("review")} type="button">Review Creative Window <span>→</span></button></div>
  </section>;
}

function ShapeYourDay({ day }: { day: CalendarDayId }) {
  const [from, setFrom] = useState(6);
  const [until, setUntil] = useState(18);
  const [copied, setCopied] = useState(false);
  const protectedBookings = prototypeBookings.filter((booking) => booking.day === day && booking.artistId === "lexi-anne");
  return <section className="calendar-view" aria-labelledby="shape-day-title">
    <div className="calendar-view-heading"><div><p className="ds-eyebrow">Artist availability concept</p><h2 id="shape-day-title">Shape Your Day</h2></div><p>Open the day, protect personal time, and let the schedule breathe.</p></div>
    <div className="shape-day-summary"><div><span>{prototypeDays.find((item) => item.id === day)?.shortLabel} · Your working day</span><strong>{formatRange(from, until)}</strong></div><button onClick={() => setCopied(true)} type="button">Copy to other retreat days</button></div>
    <div className="shape-day-ribbon">
      {prototypeHours.map((hour) => {
        const confirmed = protectedBookings.some((booking) => hour >= booking.start && hour < booking.end);
        const lunch = hour === 12;
        const active = hour >= from && hour < until;
        return <div className={`${confirmed ? "is-confirmed" : lunch ? "is-lunch" : active ? "is-open" : "is-closed"}`} key={hour}><time>{formatHour(hour)}</time><span>{confirmed ? "Confirmed · Protected" : lunch ? "Lunch · Unavailable" : active ? "Available" : "Outside your day"}</span></div>;
      })}
    </div>
    <div className="shape-day-controls"><div><p>Start your day</p><button disabled={from <= 5} onClick={() => setFrom((value) => value - 1)} type="button">Earlier</button><button disabled={from >= 9} onClick={() => setFrom((value) => value + 1)} type="button">Later</button></div><div><p>End your day</p><button disabled={until <= 16} onClick={() => setUntil((value) => value - 1)} type="button">Earlier</button><button disabled={until >= 20} onClick={() => setUntil((value) => value + 1)} type="button">Later</button></div></div>
    <p className="calendar-live-message" aria-live="polite">{copied ? "Prototype: this availability would be copied to May 8 and May 9. No records were changed." : "Confirmed reservations remain locked while you shape the surrounding day."}</p>
  </section>;
}

function AdminMasterCalendar({ day }: { day: CalendarDayId }) {
  const [selectedBooking, setSelectedBooking] = useState(prototypeBookings.find((item) => item.day === day));
  const [proposing, setProposing] = useState(false);
  const bookings = prototypeBookings.filter((booking) => booking.day === day);
  return <section className="calendar-view calendar-admin" aria-labelledby="master-calendar-title">
    <div className="calendar-view-heading"><div><p className="ds-eyebrow">Operational control</p><h2 id="master-calendar-title">Administrator Master Calendar</h2></div><p>Every artist, reservation, open window, and exception—without visual noise.</p></div>
    <div className="admin-summary"><span><strong>{bookings.length}</strong> reservations</span><span><strong>{prototypeArtists.length}</strong> artists</span><span><strong>{bookings.filter((item) => item.status === "admin-review").length}</strong> exceptions</span></div>
    <div className="admin-calendar-shell"><div className="admin-calendar-table" role="table" aria-label="Administrator schedule by artist"><div className="admin-calendar-row admin-calendar-head" role="row"><span role="columnheader">Artist</span>{prototypeHours.map((hour) => <time role="columnheader" key={hour}>{hour % 12 || 12}</time>)}</div>{prototypeArtists.map((artist) => <div className="admin-calendar-row" role="row" key={artist.id}><strong role="rowheader">{artist.name}</strong><div className="admin-row-track">{prototypeHours.map((hour) => <i key={hour} />)}{bookings.filter((booking) => booking.artistId === artist.id).map((booking) => <button className={booking.status === "admin-review" ? "is-review" : ""} key={booking.id} onClick={() => { setSelectedBooking(booking); setProposing(false); }} style={{ "--booking-start": booking.start - 6, "--booking-span": booking.end - booking.start } as React.CSSProperties} type="button"><span>{formatRange(booking.start, booking.end)}</span><strong>{booking.photographerName}</strong></button>)}</div></div>)}</div>
      <aside className="admin-detail-drawer" aria-live="polite">{selectedBooking ? <><p className="ds-eyebrow">Selected reservation</p><h3>{artistById(selectedBooking.artistId).name}</h3><dl><div><dt>Photographer</dt><dd>{selectedBooking.photographerName}</dd></div><div><dt>Time</dt><dd>{formatRange(selectedBooking.start, selectedBooking.end)}</dd></div><div><dt>Status</dt><dd>{selectedBooking.status === "admin-review" ? "Admin review" : "Confirmed"}</dd></div></dl>{proposing ? <div className="admin-move-review"><span>Before</span><p>{formatRange(selectedBooking.start, selectedBooking.end)}</p><span>Proposed</span><strong>{formatRange(selectedBooking.start + 1, selectedBooking.end + 1)}</strong><button onClick={() => setProposing(false)} type="button">Cancel proposal</button><small>Prototype only · no schedule change saved</small></div> : <button className="calendar-primary-action" onClick={() => setProposing(true)} type="button">Propose New Time</button>}</> : <p>Select a reservation to review operational details.</p>}</aside>
    </div>
  </section>;
}

export function PremiumCalendarPrototype() {
  const [view, setView] = useState<PrototypeView>("mine");
  const [day, setDay] = useState<CalendarDayId>("may-7");
  return <main className="calendar-prototype" id="main-content">
    <header className="calendar-prototype-header"><a href="#calendar-content" className="calendar-prototype-brand"><StarMark /><span>Tim Bennett<small>Project North Star</small></span></a><div><span>Internal design prototype</span><strong>Read only · Test records</strong></div></header>
    <section className="calendar-prototype-hero"><div className="calendar-prototype-hero__image"><Image src="/images/lone-star-retreat/texas-hill-country-hero-v1.jpg" alt="" fill priority sizes="100vw" /><span /></div><div className="calendar-prototype-hero__content"><p className="ds-eyebrow">Texas Hill Country Creative Retreat</p><h1>A day shaped<br />with <em>intention.</em></h1><p>May 7–9, 2027 · America/Chicago</p></div></section>
    <div className="calendar-prototype-shell" id="calendar-content">
      <nav className="calendar-view-nav" aria-label="Calendar prototype views">{(Object.keys(viewLabels) as PrototypeView[]).map((item, index) => <button aria-current={view === item ? "page" : undefined} key={item} onClick={() => setView(item)} type="button"><small>0{index + 1}</small><span>{viewLabels[item]}</span></button>)}</nav>
      <div className="calendar-prototype-context"><div><span>Selected day</span><strong>{prototypeDays.find((item) => item.id === day)?.shortLabel}</strong></div><DaySelector day={day} onChange={setDay} /></div>
      {(view === "retreat" || view === "availability" || view === "admin") && <StatusKey />}
      {view === "mine" && <MySchedule day={day} />}
      {view === "retreat" && <RetreatSchedule day={day} />}
      {view === "artists" && <ArtistSelection day={day} />}
      {view === "availability" && <ShapeYourDay day={day} />}
      {view === "admin" && <AdminMasterCalendar day={day} key={day} />}
    </div>
    <footer className="calendar-prototype-footer"><StarMark /><p>Create with <em>intention.</em><br />Build something worth <em>remembering.</em></p><span>Non-public design prototype · No live booking</span></footer>
  </main>;
}
