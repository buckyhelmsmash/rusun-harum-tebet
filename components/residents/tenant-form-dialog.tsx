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
import { useCreateTenant, useUpdateTenant } from "@/hooks/api/use-tenants";
import type { Tenant } from "@/types";

const tenantSchema = z.object({
  fullName: z.string().min(1, "Nama lengkap wajib diisi"),
  phoneNumber: z.string().min(1, "Nomor telepon wajib diisi"),
  ktpNumber: z.string().regex(/^\d{16}$/, "KTP harus tepat 16 digit"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  dateOfBirth: z.string().min(1, "Tanggal lahir wajib diisi"),
});

interface TenantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant?: Tenant | null;
}

export function TenantFormDialog({
  open,
  onOpenChange,
  tenant,
}: TenantFormDialogProps) {
  const createMutation = useCreateTenant();
  const updateMutation = useUpdateTenant();
  const isEditing = !!tenant;

  const form = useForm({
    defaultValues: {
      fullName: "",
      phoneNumber: "",
      ktpNumber: "",
      email: "",
      dateOfBirth: "",
    },
    validators: {
      // biome-ignore lint/suspicious/noExplicitAny: required for tanstack form
      onSubmit: tenantSchema as any,
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEditing && tenant) {
          const { ktpNumber: _ktp, ...updateFields } = value;
          const payload = { ...updateFields, email: value.email || undefined };
          await updateMutation.mutateAsync({ id: tenant.$id, data: payload });
          goeyToast.success("Penyewa berhasil diperbarui");
        } else {
          const payload = { ...value, email: value.email || undefined };
          await createMutation.mutateAsync(payload);
          goeyToast.success("Penyewa berhasil ditambahkan");
        }
        onOpenChange(false);
      } catch (error) {
        goeyToast.error("Gagal menyimpan penyewa.", {
          description: (error as Error).message,
        });
      }
    },
  });

  useEffect(() => {
    if (tenant && open) {
      form.reset({
        fullName: tenant.fullName,
        phoneNumber: tenant.phoneNumber,
        ktpNumber: tenant.ktpNumber,
        email: tenant.email || "",
        dateOfBirth: tenant.dateOfBirth
          ? tenant.dateOfBirth.substring(0, 10)
          : "",
      });
    } else if (!open) {
      form.reset({
        fullName: "",
        phoneNumber: "",
        ktpNumber: "",
        email: "",
        dateOfBirth: "",
      });
    }
  }, [tenant, open, form.reset]);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <ResponsiveFormContainer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Penyewa" : "Tambah Penyewa"}
      description={
        isEditing
          ? "Perbarui detail untuk penyewa ini."
          : "Daftarkan penyewa baru."
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
            name="fullName"
            validators={{ onChange: tenantSchema.shape.fullName }}
          >
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Nama Lengkap</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onInput={(e) =>
                      field.handleChange((e.target as HTMLInputElement).value)
                    }
                    aria-invalid={isInvalid}
                    placeholder="John Doe"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <form.Field
            name="ktpNumber"
            validators={{ onChange: tenantSchema.shape.ktpNumber }}
          >
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Nomor KTP</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onInput={(e) =>
                      field.handleChange((e.target as HTMLInputElement).value)
                    }
                    aria-invalid={isInvalid}
                    placeholder="3201234567890001"
                    maxLength={16}
                    disabled={isEditing}
                    className={
                      isEditing
                        ? "bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                        : ""
                    }
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field
              name="phoneNumber"
              validators={{ onChange: tenantSchema.shape.phoneNumber }}
            >
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Nomor Telepon</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onInput={(e) =>
                        field.handleChange((e.target as HTMLInputElement).value)
                      }
                      aria-invalid={isInvalid}
                      placeholder="08123456789"
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="dateOfBirth">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Tanggal Lahir</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      onInput={(e) =>
                        field.handleChange((e.target as HTMLInputElement).value)
                      }
                      aria-invalid={isInvalid}
                    />
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <form.Field name="email">
            {(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Email (opsional)</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onInput={(e) =>
                      field.handleChange((e.target as HTMLInputElement).value)
                    }
                    aria-invalid={isInvalid}
                    placeholder="tenant@email.com"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>
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
                {isLoading || isSubmitting ? "Menyimpan..." : "Simpan Penyewa"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </ResponsiveFormContainer>
  );
}
