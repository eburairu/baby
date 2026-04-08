"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDateTimeLocal } from "@/lib/dateUtils";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "@/components/ui/error-message";
import { UI_BUTTONS } from "@/constants/ui-colors";
import { cn } from "@/lib/utils";
import {
  temperatureSchema,
  TemperatureFormValues,
} from "@/schemas/temperature";
import { useBaseRecordForm } from "@/hooks/useBaseRecordForm";
import { api } from "@/lib/api";
import {
  Temperature,
  TemperatureCreate,
  TemperatureUpdate,
  TemperatureMethod,
  TEMPERATURE_METHOD_LABELS,
} from "@/types/temperature";

interface Props {
  babyId: string | number;
  initialData?: Temperature;
  onSuccess: (recordId?: number) => void;
  onUpdate?: (
    id: number,
    data: TemperatureUpdate,
  ) => Promise<Temperature | undefined>;
}

export function TemperatureForm({
  babyId,
  initialData,
  onSuccess,
  onUpdate,
}: Props) {
  const isEditing = !!initialData;

  const form = useForm<TemperatureFormValues>({
    resolver: zodResolver(temperatureSchema),
    defaultValues: {
      measured_at: initialData?.measured_at
        ? formatDateTimeLocal(initialData.measured_at)
        : formatDateTimeLocal(new Date()),
      temperature:
        initialData?.temperature != null ? String(initialData.temperature) : "",
      method: initialData?.method ?? TemperatureMethod.AXILLARY,
      notes: initialData?.notes ?? "",
    },
  });

  const { submitRecord, isSubmitting, error } =
    useBaseRecordForm<TemperatureFormValues>({
      endpoint: "/temperatures/",
      babyId,
      onSuccess: (data) => {
        if (!isEditing) {
          form.reset({
            measured_at: formatDateTimeLocal(new Date()),
            temperature: "",
            method: TemperatureMethod.AXILLARY,
            notes: "",
          });
        }
        onSuccess((data as { id?: number })?.id);
      },
      errorMessage: "エラーが発生しました。もう一度お試しください。",
      successMessage: isEditing ? "更新しました" : undefined,
    });

  const onSubmit = async (values: TemperatureFormValues) => {
    await submitRecord<TemperatureCreate, Temperature | undefined>(
      values,
      (vals) => ({
        baby_id: Number(babyId),
        measured_at: new Date(vals.measured_at).toISOString(),
        temperature: parseFloat(vals.temperature),
        method: vals.method,
        notes: vals.notes?.trim() || null,
      }),
      isEditing && initialData
        ? async (payload: TemperatureCreate) => {
            const updatePayload: TemperatureUpdate = {
              measured_at: payload.measured_at,
              temperature: payload.temperature,
              method: payload.method,
              notes: payload.notes,
            };
            if (onUpdate) {
              return await onUpdate(initialData.id, updatePayload);
            } else {
              return await api.put<Temperature>(
                `/temperatures/${initialData.id}`,
                updatePayload,
              );
            }
          }
        : undefined,
    );
  };

  return (
    <Card
      className={cn(
        "rounded-2xl shadow-sm border-0 mb-6 transition-colors",
        isEditing && "mb-0 shadow-none",
      )}
    >
      <CardContent className={cn("pt-6", isEditing && "p-0")}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="temperature"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">
                      体温 (°C)
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type="number"
                          step="0.1"
                          min="34.0"
                          max="42.0"
                          placeholder="36.5"
                          {...field}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                          °C
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">
                      測定部位
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        {Object.entries(TEMPERATURE_METHOD_LABELS).map(
                          ([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ),
                        )}
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="measured_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    測定日時
                  </FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">
                    メモ
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="症状、薬の服用など..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error && <ErrorMessage message={error} />}

            <Button
              type="submit"
              className={cn("w-full rounded-xl h-11", UI_BUTTONS.primary)}
              loading={isSubmitting}
              data-sentry-unmask
            >
              {isEditing ? "更新する" : "保存する"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
