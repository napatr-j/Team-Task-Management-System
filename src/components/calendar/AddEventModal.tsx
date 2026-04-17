"use client";

import { useState } from "react";
import { User } from "@/types/calendar";

interface Props {
  users: User[];
  onAdd: (eventData: {
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    participantIds?: string[];
  }) => void;
  onClose: () => void;
}

function formatDateTime(value: Date) {
  const tzOffset = value.getTimezoneOffset() * 60000;
  return new Date(value.getTime() - tzOffset).toISOString().slice(0, 16);
}

export default function AddEventModal({ users, onAdd, onClose }: Props) {
  const now = new Date();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startTime, setStartTime] = useState(formatDateTime(now));
  const [endTime, setEndTime] = useState(formatDateTime(new Date(now.getTime() + 60 * 60 * 1000)));
  const [minStartTime] = useState(formatDateTime(now));
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleParticipant = (id: string) => {
    setParticipantIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setError("Event title is required.");
      return;
    }

    const startDate = new Date(startTime);
    const nowDate = new Date();
    if (startDate < nowDate) {
      setError("Event start time must be in the present or future.");
      return;
    }

    if (new Date(endTime) < startDate) {
      setError("End time must be after start time.");
      return;
    }

    onAdd({
      title: title.trim(),
      description: description.trim(),
      start_time: startTime,
      end_time: endTime,
      participantIds,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center p-4">
      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[#111827]">Add Event</h3>
          <button onClick={onClose} className="text-xl font-bold text-[#374151]">×</button>
        </div>
        <div className="grid gap-4">
          <label className="block text-sm font-medium text-[#374151]">
            Title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
              placeholder="Event title"
            />
          </label>

          <label className="block text-sm font-medium text-[#374151]">
            Description
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
              placeholder="Event details"
              rows={4}
            />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-medium text-[#374151]">
              Start
              <input
                type="datetime-local"
                min={minStartTime}
                value={startTime}
                onChange={(event) => setStartTime(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
              />
            </label>
            <label className="block text-sm font-medium text-[#374151]">
              End
              <input
                type="datetime-local"
                value={endTime}
                onChange={(event) => setEndTime(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-[#D1D5DB] bg-[#F9FAFB] px-4 py-3 text-sm text-[#111827] outline-none focus:border-[#84934A] focus:ring-2 focus:ring-[#84934A]/20"
              />
            </label>
          </div>

          <div className="rounded-2xl border border-[#D1D5DB] bg-[#F8FAFB] p-4">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-[#374151]">Participants</p>
              <span className="text-xs text-[#6B7280]">Optional</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {users.length === 0 ? (
                <p className="text-sm text-[#6B7280]">No group members available.</p>
              ) : (
                users.map((user) => {
                  const selected = participantIds.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => toggleParticipant(user.id)}
                      className={`rounded-full border px-3 py-2 text-sm transition ${
                        selected
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

          {error && <div className="rounded-2xl border border-[#FECACA] bg-[#FEF2F2] px-4 py-3 text-sm text-[#991B1B]">{error}</div>}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 rounded-2xl bg-[#84934A] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#656D3F]"
            >
              Create Event
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-2xl border border-[#D1D5DB] bg-white px-5 py-3 text-sm font-semibold text-[#374151] transition hover:bg-[#F3F4F6]"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
