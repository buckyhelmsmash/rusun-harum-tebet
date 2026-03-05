"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import * as z from "zod";
import { ResponsiveFormContainer } from "@/components/shared/responsive-form-container";
import { Button } from "@/components/ui/button";

import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { goeyToast } from "@/components/ui/goey-toaster";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateVehicle, useUpdateVehicle } from "@/hooks/api/use-vehicles";
import type { Vehicle } from "@/types";

const vehicleSchema = z.object({
  licensePlate: z
    .string()
    .min(2, "License plate is required")
    .transform((val) => val.toUpperCase().replace(/\s+/g, " ").trim())
    .pipe(
      z
        .string()
        .regex(
          /^[A-Z]{1,2}\s?\d{1,4}\s?[A-Z]{0,3}$/,
          "Invalid plate format (e.g. B 1234 ABC)",
        ),
    ),
  vehicleType: z.enum(["car", "motorcycle"]),
  brand: z.string().min(1, "Brand is required"),
  color: z.string().min(1, "Color is required"),
});

type VehicleFormValues = z.infer<typeof vehicleSchema>;

interface VehicleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  unitId: string;
  vehicle?: Vehicle | null; // If provided, we are in edit mode
}

export function VehicleFormDialog({
  open,
  onOpenChange,
  unitId,
  vehicle,
}: VehicleFormDialogProps) {
  const createMutation = useCreateVehicle();
  const updateMutation = useUpdateVehicle();
  const isEditing = !!vehicle;

  const form = useForm({
    defaultValues: {
      licensePlate: "",
      vehicleType: "car" as VehicleFormValues["vehicleType"],
      brand: "",
      color: "",
    },
    validators: {
      // biome-ignore lint/suspicious/noExplicitAny: required for ts type inference inside tanstack form
      onSubmit: vehicleSchema as any,
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEditing && vehicle) {
          await updateMutation.mutateAsync({
            id: vehicle.$id,
            unitId,
            data: value,
          });
          goeyToast.success("Kendaraan berhasil diperbarui");
        } else {
          await createMutation.mutateAsync({
            ...value,
            unit: unitId,
          });
          goeyToast.success("Kendaraan berhasil ditambahkan");
        }
        onOpenChange(false);
      } catch (error) {
        goeyToast.error("Gagal menyimpan kendaraan.", {
          description: (error as Error).message,
        });
      }
    },
  });

  useEffect(() => {
    if (vehicle && open) {
      form.reset({
        licensePlate: vehicle.licensePlate,
        vehicleType: vehicle.vehicleType,
        brand: vehicle.brand || "",
        color: vehicle.color || "",
      });
    } else if (!open) {
      form.reset({
        licensePlate: "",
        vehicleType: "car",
        brand: "",
        color: "",
      });
    }
  }, [vehicle, open, form.reset]);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <ResponsiveFormContainer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Kendaraan" : "Tambah Kendaraan"}
      description={
        isEditing
          ? "Perbarui detail untuk kendaraan terdaftar."
          : "Daftarkan kendaraan baru untuk unit ini."
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-4"
      >
        <FieldGroup>
          <form.Field
            name="licensePlate"
            validators={{
              onChange: vehicleSchema.shape.licensePlate,
            }}
          >
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Plat Nomor</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="B 1234 ABC"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field
            name="vehicleType"
            validators={{
              onChange: vehicleSchema.shape.vehicleType,
            }}
          >
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Tipe Kendaraan</FieldLabel>
                  <Select
                    onValueChange={(val) =>
                      field.handleChange(
                        val as VehicleFormValues["vehicleType"],
                      )
                    }
                    defaultValue={field.state.value}
                    value={field.state.value}
                  >
                    <SelectTrigger
                      className="capitalize"
                      aria-invalid={isInvalid}
                    >
                      <SelectValue placeholder="Pilih tipe kendaraan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Mobil</SelectItem>
                      <SelectItem value="motorcycle">Motor</SelectItem>
                    </SelectContent>
                  </Select>
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="brand"
              validators={{
                onChange: vehicleSchema.shape.brand,
              }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Merek</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="contoh: Toyota"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field
              name="color"
              validators={{
                onChange: vehicleSchema.shape.color,
              }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Warna</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="contoh: Hitam"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </div>
        </FieldGroup>

        <div className="pt-4 flex w-full justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
          <form.Subscribe
            selector={(state) => [
              state.canSubmit,
              state.isSubmitting,
              state.isPristine,
            ]}
          >
            {([canSubmit, isSubmitting, isPristine]) => (
              <Button
                type="submit"
                disabled={
                  !canSubmit ||
                  isLoading ||
                  isSubmitting ||
                  (isEditing && isPristine)
                }
              >
                {isLoading || isSubmitting
                  ? "Menyimpan..."
                  : "Simpan Kendaraan"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </ResponsiveFormContainer>
  );
}
