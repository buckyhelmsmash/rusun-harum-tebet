"use client";

import { useForm } from "@tanstack/react-form";
import { useEffect } from "react";
import * as z from "zod";
import { ResponsiveFormContainer } from "@/components/responsive-form-container";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
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
  licensePlate: z.string().min(2, "License plate is required"),
  vehicleType: z.enum(["car", "motorcycle", "box_car"]),
  brand: z.string().optional(),
  color: z.string().optional(),
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
        } else {
          await createMutation.mutateAsync({
            ...value,
            unit: unitId,
          });
        }
        onOpenChange(false);
      } catch (error) {
        console.error("Failed to save vehicle", error);
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
      title={isEditing ? "Edit Vehicle" : "Add Vehicle"}
      description={
        isEditing
          ? "Update details for the registered vehicle."
          : "Register a new vehicle for this unit."
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
                  <FieldLabel htmlFor={field.name}>License Plate</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="B 1234 ABC"
                  />
                  {isInvalid && (
                    <FieldError>
                      {field.state.meta.errors.join(", ")}
                    </FieldError>
                  )}
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
                  <FieldLabel htmlFor={field.name}>Vehicle Type</FieldLabel>
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
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="car">Car</SelectItem>
                      <SelectItem value="motorcycle">Motorcycle</SelectItem>
                      <SelectItem value="box_car">Box Car</SelectItem>
                    </SelectContent>
                  </Select>
                  {isInvalid && (
                    <FieldError>
                      {field.state.meta.errors.join(", ")}
                    </FieldError>
                  )}
                </Field>
              );
            }}
          </form.Field>

          <div className="grid grid-cols-2 gap-4">
            <form.Field name="brand">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Brand</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="e.g. Toyota"
                    />
                    {isInvalid && (
                      <FieldError>
                        {field.state.meta.errors.join(", ")}
                      </FieldError>
                    )}
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="color">
              {(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Color</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      placeholder="e.g. Black"
                    />
                    {isInvalid && (
                      <FieldError>
                        {field.state.meta.errors.join(", ")}
                      </FieldError>
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
                {isLoading || isSubmitting ? "Saving..." : "Save Vehicle"}
              </Button>
            )}
          </form.Subscribe>
        </div>
      </form>
    </ResponsiveFormContainer>
  );
}
