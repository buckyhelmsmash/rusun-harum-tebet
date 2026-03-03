"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { ResponsiveFormContainer } from "@/components/responsive-form-container";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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

  const form = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      licensePlate: "",
      vehicleType: "car",
      brand: "",
      color: "",
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
  }, [vehicle, open, form]);

  async function onSubmit(data: VehicleFormValues) {
    try {
      if (isEditing && vehicle) {
        await updateMutation.mutateAsync({
          id: vehicle.$id,
          unitId,
          data,
        });
      } else {
        await createMutation.mutateAsync({
          ...data,
          unit: unitId,
        });
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to save vehicle", error);
      // TODO: add toast notification
    }
  }

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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="licensePlate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>License Plate</FormLabel>
                <FormControl>
                  <Input placeholder="B 1234 ABC" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="vehicleType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Vehicle Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="capitalize">
                      <SelectValue placeholder="Select vehicle type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="car">Car</SelectItem>
                    <SelectItem value="motorcycle">Motorcycle</SelectItem>
                    <SelectItem value="box_car">Box Car</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="brand"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Toyota" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Black" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="pt-4 flex w-full justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Vehicle"}
            </Button>
          </div>
        </form>
      </Form>
    </ResponsiveFormContainer>
  );
}
