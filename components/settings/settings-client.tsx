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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { account } from "@/lib/appwrite/client";

interface SettingsData {
  publicFacilityFee: number;
  guardFee: number;
  waterRate: number;
  car1Fee: number;
  car2Fee: number;
  car3Fee: number;
  meetingNumber?: string;
}

const FEE_FIELDS = [
  {
    key: "publicFacilityFee" as const,
    label: "Biaya Sarana Umum",
    description: "Kontribusi bulanan untuk pemeliharaan fasilitas umum",
    suffix: "/ bulan",
  },
  {
    key: "guardFee" as const,
    label: "Biaya Penjagaan",
    description: "Biaya bulanan layanan keamanan / penjagaan per unit",
    suffix: "/ bulan",
  },
  {
    key: "waterRate" as const,
    label: "Tarif Air",
    description: "Harga per meter kubik pemakaian air",
    suffix: "/ m³",
  },
];

const CAR_FEE_FIELDS = [
  {
    key: "car1Fee" as const,
    label: "Biaya 1 Mobil",
    description: "Biaya parkir bulanan untuk unit yang memiliki 1 mobil",
  },
  {
    key: "car2Fee" as const,
    label: "Biaya 2 Mobil",
    description: "Biaya parkir bulanan untuk unit yang memiliki 2 mobil",
  },
  {
    key: "car3Fee" as const,
    label: "Biaya 3 Mobil (maks)",
    description: "Biaya parkir bulanan untuk unit yang memiliki 3 mobil",
  },
];

export function SettingsClient() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    publicFacilityFee: 0,
    guardFee: 0,
    waterRate: 0,
    car1Fee: 0,
    car2Fee: 0,
    car3Fee: 0,
    meetingNumber: "",
  });
  const [original, setOriginal] = useState<SettingsData | null>(null);
  const [meetingNumber, setMeetingNumber] = useState("");

  useEffect(() => {
    fetch("/api/settings")
      .then((res) => res.json())
      .then((data: SettingsData) => {
        setSettings(data);
        setOriginal(data);
      })
      .catch(() => goeyToast.error("Gagal memuat pengaturan"))
      .finally(() => setLoading(false));
  }, []);

  const hasChanges =
    original !== null &&
    (settings.publicFacilityFee !== original.publicFacilityFee ||
      settings.guardFee !== original.guardFee ||
      settings.waterRate !== original.waterRate ||
      settings.car1Fee !== original.car1Fee ||
      settings.car2Fee !== original.car2Fee ||
      settings.car3Fee !== original.car3Fee);

  const handleSave = async () => {
    if (!meetingNumber.trim()) {
      goeyToast.error(
        "Nomor berita acara rapat wajib diisi untuk menyimpan perubahan",
      );
      return;
    }

    setSaving(true);
    try {
      const session = await account.createJWT();

      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.jwt}`,
        },
        body: JSON.stringify({
          ...settings,
          meetingNumber: meetingNumber.trim(),
        }),
      });

      if (!res.ok) throw new Error("Gagal menyimpan pengaturan");

      const updated: SettingsData = await res.json();
      setSettings(updated);
      setOriginal(updated);
      goeyToast.success("Pengaturan berhasil diperbarui");
    } catch {
      goeyToast.error("Gagal menyimpan pengaturan");
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (
    key: keyof Omit<SettingsData, "meetingNumber">,
    value: string,
  ) => {
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
          <h1 className="text-3xl font-bold tracking-tight">Pengaturan</h1>
          <p className="text-muted-foreground">
            Kelola parameter biaya tagihan yang digunakan untuk pembuatan
            tagihan
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
            <CardTitle>Biaya Tagihan</CardTitle>
          </div>
          <CardDescription>
            Nilai-nilai ini diterapkan saat membuat tagihan bulanan dan
            menghitung jumlah pemakaian air.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          {FEE_FIELDS.map((field) => (
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

      <Card>
        <CardHeader>
          <CardTitle>Biaya Parkir Kendaraan</CardTitle>
          <CardDescription>
            Biaya bulanan bertingkat berdasarkan jumlah mobil per unit. Maksimal
            3 mobil per unit. Motor gratis.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-3">
          {CAR_FEE_FIELDS.map((field) => (
            <div key={field.key} className="space-y-2">
              <label
                htmlFor={field.key}
                className="text-sm font-medium leading-none"
              >
                {field.label}
              </label>
              <CurrencyInput
                id={field.key}
                suffix="/ bulan"
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

      {hasChanges && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardHeader>
            <CardTitle className="text-amber-800 dark:text-amber-200">
              Persetujuan Rapat Umum
            </CardTitle>
            <CardDescription className="text-amber-700 dark:text-amber-300">
              Mengubah pengaturan biaya memerlukan persetujuan dari Rapat Umum
              Anggota. Masukkan nomor referensi berita acara rapat di bawah ini.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="meetingNumber">
                Nomor Referensi Berita Acara Rapat
              </Label>
              <Input
                id="meetingNumber"
                placeholder="mis. RAPAT/2026/III/001"
                value={meetingNumber}
                onChange={(e) => setMeetingNumber(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
