"use client";

import {
  parseActivityMetadata,
  extractChanges,
  extractMeetingNumber,
} from "@/lib/activity/types";
import { ChangesDisplay } from "./changes-display";

interface MetadataRendererProps {
  metadata?: string;
  variant?: "default" | "compact";
}

export function MetadataRenderer({
  metadata,
  variant = "default",
}: MetadataRendererProps) {
  const parsed = parseActivityMetadata(metadata);
  if (!parsed) return null;

  const changes = extractChanges(parsed);
  const meetingNumber = extractMeetingNumber(parsed);

  if (variant === "compact") {
    if (changes && changes.length > 0) {
      return (
        <span className="text-xs text-slate-400">
          {changes.length} perubahan
        </span>
      );
    }
    return null;
  }

  const sections: React.ReactNode[] = [];

  if (meetingNumber) {
    sections.push(
      <p
        key="meeting"
        className="text-xs font-medium text-amber-600 dark:text-amber-400"
      >
        No. Rapat: {meetingNumber}
      </p>,
    );
  }

  if (changes && changes.length > 0) {
    sections.push(
      <ChangesDisplay key="changes" changes={changes} variant="chips" />,
    );
  }

  if ("period" in parsed && "usage" in parsed) {
    const meta = parsed as {
      period: string;
      previousMeter: number;
      currentMeter: number;
      usage: number;
    };
    sections.push(
      <p key="meter" className="text-xs text-slate-500">
        Meteran: {meta.previousMeter.toLocaleString()} →{" "}
        {meta.currentMeter.toLocaleString()} ({meta.usage} m³)
      </p>,
    );
  }

  if (
    "period" in parsed &&
    "totalDue" in parsed &&
    !("usage" in parsed)
  ) {
    const meta = parsed as { period: string; totalDue: number };
    sections.push(
      <p key="invoice" className="text-xs text-slate-500">
        Total: Rp {meta.totalDue.toLocaleString("id-ID")}
      </p>,
    );
  }

  if ("licensePlate" in parsed) {
    const meta = parsed as { licensePlate: string; vehicleType: string };
    sections.push(
      <p key="vehicle" className="text-xs text-slate-500">
        {meta.vehicleType === "car" ? "Mobil" : "Motor"} — {meta.licensePlate}
      </p>,
    );
  }

  if (sections.length === 0) return null;

  return <div className="mt-2 space-y-1.5">{sections}</div>;
}
