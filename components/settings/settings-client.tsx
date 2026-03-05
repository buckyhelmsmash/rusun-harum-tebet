"use client";

import { Loader2, Save, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CurrencyInput } from "@/components/ui/currency-input";
import { goeyToast } from "@/components/ui/goey-toaster";
import { account } from "@/lib/appwrite/client";

interface SettingsData {
  iplFee: number;
  publicFacilityFee: number;
  guardFee: number;
  waterRate: number;
}

const FIELD_CONFIG = [
  {
    key: "iplFee" as const,
    label: "IPL Fee",
    description:
      "Iuran Pengelolaan Lingkungan — monthly management fee per unit",
    suffix: "/ month",
  },
  {
    key: "publicFacilityFee" as const,
    label: "Public Facility Fee",
    description: "Monthly public facility maintenance contribution",
    suffix: "/ month",
  },
  {
    key: "guardFee" as const,
    label: "Security Guard Fee",
    description: "Monthly security / guard service fee per unit",
    suffix: "/ month",
  },
  {
    key: "waterRate" as const,
    label: "Water Rate",
    description: "Price per cubic meter of water usage",
    suffix: "/ m³",
  },
];

export function SettingsClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    iplFee: 0,
    publicFacilityFee: 0,
    guardFee: 0,
    waterRate: 0,
  });
  const [original, setOriginal] = useState<SettingsData | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data: SettingsData) => {
        setSettings(data);
        setOriginal(data);
      })
      .catch(() => goeyToast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const hasChanges =
    original !== null &&
    (settings.iplFee !== original.iplFee ||
      settings.publicFacilityFee !== original.publicFacilityFee ||
      settings.guardFee !== original.guardFee ||
      settings.waterRate !== original.waterRate);

  const handleSave = async () => {
    setSaving(true);
    try {
      const session = await account.createJWT();

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.jwt}`,
        },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      const updated: SettingsData = await res.json();
      setSettings(updated);
      setOriginal(updated);
      goeyToast.success("Settings updated successfully");
    } catch {
      goeyToast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (key: keyof SettingsData, value: string) => {
    const num = Number.parseInt(value, 10);
    setSettings((prev) => ({ ...prev, [key]: Number.isNaN(num) ? 0 : num }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage billing fee parameters used for invoice generation
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving || !hasChanges}>
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Billing Fees</CardTitle>
          </div>
          <CardDescription>
            These values are applied when generating monthly invoices and
            calculating water usage amounts.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          {FIELD_CONFIG.map((field) => (
            <div key={field.key} className="space-y-2">
              <label
                htmlFor={field.key}
                className="text-sm font-medium leading-none"
              >
                {field.label}
              </label>
              <CurrencyInput
                id={field.key}
                suffix={field.suffix}
                value={settings[field.key]}
                onChange={(e) => handleFieldChange(field.key, e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {field.description}
              </p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
