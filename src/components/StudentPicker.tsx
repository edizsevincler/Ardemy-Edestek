"use client";

import { useState } from "react";

export function StudentPicker({
  students,
}: {
  students: { id: string; name: string }[];
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allSelected = selected.size === students.length && students.length > 0;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(students.map((s) => s.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">
          Öğrenciler
        </label>
        <button
          type="button"
          onClick={toggleAll}
          className="text-xs font-medium text-slate-600 hover:text-slate-900"
        >
          {allSelected ? "Tümünü kaldır" : "Tümünü seç"}
        </button>
      </div>
      <div className="max-h-48 overflow-y-auto rounded-md border border-slate-300 p-2">
        {students.map((student) => (
          <label
            key={student.id}
            className="flex items-center gap-2 px-1 py-1 text-sm text-slate-700"
          >
            <input
              type="checkbox"
              name="studentIds"
              value={student.id}
              checked={selected.has(student.id)}
              onChange={() => toggleOne(student.id)}
            />
            {student.name}
          </label>
        ))}
        {students.length === 0 && (
          <p className="px-1 py-1 text-sm text-slate-400">
            Önce öğrenci ekleyin.
          </p>
        )}
      </div>
    </div>
  );
}
