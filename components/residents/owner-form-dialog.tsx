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
import { useCreateOwner, useUpdateOwner } from "@/hooks/api/use-owners";
import type { Owner } from "@/types";

const ownerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  ktpNumber: z.string().regex(/^\d{16}$/, "KTP must be exactly 16 digits"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
});

interface OwnerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owner?: Owner | null;
}

export function OwnerFormDialog({
  open,
  onOpenChange,
  owner,
}: OwnerFormDialogProps) {
  const createMutation = useCreateOwner();
  const updateMutation = useUpdateOwner();
  const isEditing = !!owner;

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
      onSubmit: ownerSchema as any,
    },
    onSubmit: async ({ value }) => {
      try {
        if (isEditing && owner) {
          const { ktpNumber: _ktp, ...updateFields } = value;
          const payload = { ...updateFields, email: value.email || undefined };
          await updateMutation.mutateAsync({ id: owner.$id, data: payload });
          goeyToast.success("Owner updated successfully");
        } else {
          const payload = { ...value, email: value.email || undefined };
          await createMutation.mutateAsync(payload);
          goeyToast.success("Owner added successfully");
        }
        onOpenChange(false);
      } catch (error) {
        goeyToast.error("Failed to save owner.", {
          description: (error as Error).message,
        });
      }
    },
  });

  useEffect(() => {
    if (owner && open) {
      form.reset({
        fullName: owner.fullName,
        phoneNumber: owner.phoneNumber,
        ktpNumber: owner.ktpNumber,
        email: owner.email || "",
        dateOfBirth: owner.dateOfBirth
          ? owner.dateOfBirth.substring(0, 10)
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
  }, [owner, open, form.reset]);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <ResponsiveFormContainer
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? "Edit Owner" : "Add Owner"}
      description={
        isEditing ? "Update details for this owner." : "Register a new owner."
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
            validators={{ onChange: ownerSchema.shape.fullName }}
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
            validators={{ onChange: ownerSchema.shape.ktpNumber }}
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
              validators={{ onChange: ownerSchema.shape.phoneNumber }}
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
                    <FieldLabel htmlFor={field.name}>Date of Birth</FieldLabel>
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
                  <FieldLabel htmlFor={field.name}>Email (optional)</FieldLabel>
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
                    placeholder="owner@email.com"
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
                {isLoading || isSubmitting ? "Saving..." : "Save Owner"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </ResponsiveFormContainer>
  );
}
