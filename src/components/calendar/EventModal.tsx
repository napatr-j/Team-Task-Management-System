"use client";

import { useMemo, useState } from "react";
import { CalendarEvent, User } from "@/types/calendar";

interface Props {
  event: CalendarEvent;
  users: User[];
  onClose: () => void;
  onUpdate: (event: CalendarEvent) => void;
  onDelete: () => void;
}

export default function EventModal({ event, users, onClose, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<CalendarEvent>(event);
  const [selectedParticipants, setSelectedParticipants] = useState<string[]>(event.participants ?? []);

  const toggleParticipant = (id: string) => {
    setSelectedParticipants((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const handleSave = () => {
    onUpdate({ ...form, participants: selectedParticipants });
    setEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#111827]">Event details</h3>
          <button onClick={onClose} className="text-xl font-bold text-[#374151]">×</button>
        </div>

        <div className="grid gap-4">
          {editing ? (
            <>
              <label className="block text-sm font-medium text-[#374151]">
                Title
                <input
                  name="title"
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
                />
              </label>
              <label className="block text-sm font-medium text-[#374151]">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={(event) => setForm({ ...form, description: event.target.value })}
                  className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
                  rows={4}
                />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-[#374151]">
                  Start
                  <input
                    type="datetime-local"
                    value={form.start_time.slice(0, 16)}
                    onChange={(event) => setForm({ ...form, start_time: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
                  />
                </label>
                <label className="block text-sm font-medium text-[#374151]">
                  End
                  <input
                    type="datetime-local"
                    value={form.end_time.slice(0, 16)}
                    onChange={(event) => setForm({ ...form, end_time: event.target.value })}
                    className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
                  />
                </label>
              </div>
              <div className="rounded-2xl border border-[#D1D5DB] bg-[#F8FAFB] p-4">
                <div className="mb-2 text-sm font-medium text-[#374151]">Participants</div>
                <div className="flex flex-wrap gap-2">
                  {users.length === 0 ? (
                    <span className="text-sm text-[#6B7280]">No members available.</span>
                  ) : (
                    users.map((user) => {
                      const active = selectedParticipants.includes(user.id);
                      return (
                        <button
                          key={user.id}
                          type="button"
                          onClick={() => toggleParticipant(user.id)}
                          className={`rounded-full border px-3 py-2 text-sm transition ${
                            active
                              ? "border-[#84934A] bg-[#EAF0E2] text-[#1F4330]"
                              : "border-[#D1D5DB] bg-white text-[#374151] hover:bg-[#F3F4F6]"
                          }`}
                        >
                          {user.email}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <h4 className="text-lg font-semibold text-[#111827]">{event.title}</h4>
                <p className="text-sm text-[#6B7280] mt-1">{event.description || "No description."}</p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Start</p>
                  <p className="mt-2 text-sm text-[#111827]">{new Date(event.start_time).toLocaleString()}</p>
                </div>
                <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">End</p>
                  <p className="mt-2 text-sm text-[#111827]">{new Date(event.end_time).toLocaleString()}</p>
                </div>
              </div>
              <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[#6B7280]">Participants</p>
                <p className="mt-2 text-sm text-[#111827]">
                  {(event.participants?.length ?? 0) === 0
                    ? "None"
                    : event.participants?.map((id) => users.find((user) => user.id === id)?.email ?? id).join(", ")}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          {!editing ? (
            <>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="rounded-2xl bg-[#84934A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#656D3F]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="rounded-2xl border border-[#F87171] bg-white px-5 py-3 text-sm font-semibold text-[#B91C1C] transition hover:bg-[#FEE2E2]"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSave}
                className="rounded-2xl bg-[#84934A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#656D3F]"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setForm(event);
                  setSelectedParticipants(event.participants ?? []);
                }}
                className="rounded-2xl border border-[#D1D5DB] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#F3F4F6]"
              >
                Cancel
              </button>
            </>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-2xl border border-[#D1D5DB] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#F3F4F6]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
