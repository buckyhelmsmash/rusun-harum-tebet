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
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  ktpNumber: z.string().min(16, "KTP must be 16 digits").max(16),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  startDate: z.string().optional().or(z.literal("")),
  endDate: z.string().optional().or(z.literal("")),
});

type TenantFormValues = z.infer<typeof tenantSchema>;

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
      startDate: "",
      endDate: "",
    } as TenantFormValues,
    validators: {
      // biome-ignore lint/suspicious/noExplicitAny: required for tanstack form
      onSubmit: tenantSchema as any,
    },
    onSubmit: async ({ value }) => {
      try {
        const payload = {
          ...value,
          email: value.email || undefined,
          startDate: value.startDate || undefined,
          endDate: value.endDate || undefined,
        };
        if (isEditing && tenant) {
          await updateMutation.mutateAsync({ id: tenant.$id, data: payload });
          goeyToast.success("Tenant updated successfully");
        } else {
          await createMutation.mutateAsync(payload);
          goeyToast.success("Tenant added successfully");
        }
        onOpenChange(false);
      } catch (error) {
        goeyToast.error("Failed to save tenant.", {
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
        startDate: tenant.startDate ? tenant.startDate.substring(0, 10) : "",
        endDate: tenant.endDate ? tenant.endDate.substring(0, 10) : "",
      });
    } else if (!open) {
      form.reset({
        fullName: "",
        phoneNumber: "",
        ktpNumber: "",
        email: "",
        dateOfBirth: "",
        startDate: "",
        endDate: "",
      });
    }
  }, [tenant, open, form.reset]);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <ResponsiveFormContainer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Tenant" : "Add Tenant"}
      description={
        isEditing ? "Update details for this tenant." : "Register a new tenant."
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
                  <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
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
                  <FieldLabel htmlFor={field.name}>KTP Number</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="3201234567890001"
                    maxLength={16}
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
                    <FieldLabel htmlFor={field.name}>Phone Number</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
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
                    <FieldLabel htmlFor={field.name}>Date of Birth</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      type="date"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
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
                  <FieldLabel htmlFor={field.name}>Email (optional)</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="tenant@email.com"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="startDate">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Lease Start Date</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="date"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="endDate">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Lease End Date</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="date"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                </Field>
              )}
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
            Cancel
          </Button>
          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                disabled={!canSubmit || isLoading || isSubmitting}
              >
                {isLoading || isSubmitting ? "Saving..." : "Save Tenant"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </ResponsiveFormContainer>
  );
}
