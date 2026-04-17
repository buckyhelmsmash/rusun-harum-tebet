"use client";

import {
  formatChangeValue,
  formatFieldLabel,
} from "@/lib/activity/constants";
import type { ChangeEntry } from "@/lib/activity/types";

interface ChangesDisplayProps {
  changes: ChangeEntry[];
  variant?: "chips" | "table";
}

function ChipsVariant({ changes }: { changes: ChangeEntry[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {changes.map((change) => (
        <div
          key={change.field}
          className="text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-1.5 rounded-md border border-slate-100 dark:border-slate-800"
        >
          <span className="font-medium text-slate-700 dark:text-slate-300 mr-1">
            {formatFieldLabel(change.field)}:
          </span>
          <span className="line-through opacity-70 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-1 rounded mr-1">
            {formatChangeValue(change.old)}
          </span>
          <span className="opacity-90 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 px-1 rounded">
            {formatChangeValue(change.new)}
          </span>
        </div>
      ))}
    </div>
  );
}

function TableVariant({ changes }: { changes: ChangeEntry[] }) {
  return (
    <div className="rounded-md border border-slate-200 dark:border-slate-700 overflow-hidden">
      <table className="w-full text-xs">
        <thead>
          <tr className="bg-slate-50 dark:bg-slate-800/50">
            <th className="text-left px-2 py-1 font-medium text-slate-500">
              Kolom
            </th>
            <th className="text-left px-2 py-1 font-medium text-slate-500">
              Sebelum
            </th>
            <th className="text-left px-2 py-1 font-medium text-slate-500">
              Sesudah
            </th>
          </tr>
        </thead>
        <tbody>
          {changes.map((c) => (
            <tr
              key={c.field}
              className="border-t border-slate-100 dark:border-slate-800"
            >
              <td className="px-2 py-1 font-medium text-slate-600 dark:text-slate-300">
                {formatFieldLabel(c.field)}
              </td>
              <td className="px-2 py-1 text-red-500 line-through">
                {formatChangeValue(c.old)}
              </td>
              <td className="px-2 py-1 text-emerald-600 font-medium">
                {formatChangeValue(c.new)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ChangesDisplay({
  changes,
  variant = "chips",
}: ChangesDisplayProps) {
  if (changes.length === 0) return null;

  return variant === "table" ? (
    <TableVariant changes={changes} />
  ) : (
    <ChipsVariant changes={changes} />
  );
}
