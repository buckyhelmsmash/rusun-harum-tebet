"use client";

import { AlertCircle, CheckCircle2, Trash2, UploadCloud } from "lucide-react";
import { useState } from "react";
import * as xlsx from "xlsx";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { goeyToast } from "@/components/ui/goey-toaster";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  type ExcelImportRow,
  excelImportRowSchema,
} from "@/lib/schemas/water-usages";

interface WaterUsageImportProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function WaterUsageImport({
  open,
  onOpenChange,
  onSuccess,
}: WaterUsageImportProps) {
  const [file, setFile] = useState<File | null>(null);
  const [period, setPeriod] = useState(
    new Date()
      .toISOString()
      .slice(0, 7), // Default to current YYYY-MM
  );
  const [parsedData, setParsedData] = useState<ExcelImportRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    parseExcel(selectedFile);
  };

  const parseExcel = async (f: File) => {
    try {
      const buffer = await f.arrayBuffer();
      const workbook = xlsx.read(buffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const rawJson = xlsx.utils.sheet_to_json(worksheet);

      // Validate schema
      const validationResult = z.array(excelImportRowSchema).safeParse(rawJson);

      if (!validationResult.success) {
        setErrors([
          "Invalid file format. Ensure columns exact match: 'Unit ID', 'Previous Meter', 'Current Meter'.",
        ]);
        setParsedData([]);
        return;
      }

      const validRows = validationResult.data;
      const validationErrors: string[] = [];

      // Logical validation
      validRows.forEach((row, idx) => {
        if (row["Current Meter"] < row["Previous Meter"]) {
          validationErrors.push(
            `Row ${idx + 2}: Current meter (${row["Current Meter"]}) is less than previous (${row["Previous Meter"]}) for unit ${row["Unit ID"]}`,
          );
        }
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setParsedData([]);
      } else {
        setErrors([]);
        setParsedData(validRows);
      }
    } catch (error) {
      setErrors([
        "Failed to read the excel file. Please make sure it is a valid .xlsx or .csv",
      ]);
      setParsedData([]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setParsedData([]);
    setErrors([]);
    const input = document.getElementById("excel-file") as HTMLInputElement;
    if (input) input.value = "";
  };

  const handleImport = async () => {
    if (parsedData.length === 0 || !period) return;

    setIsImporting(true);

    try {
      const response = await fetch("/api/water-usages/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // The token will be handled by the interceptors if we used generic api client
          // but since this is direct fetch, we let the session cookie handle auth
        },
        body: JSON.stringify({
          period,
          rows: parsedData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to import");
      }

      const result = await response.json();

      if (result.errors?.length > 0) {
        setErrors([
          `Processed ${result.processed}, but failed on ${result.skipped}:`,
          ...result.errors,
        ]);
        goeyToast.warning(`Import completed with ${result.skipped} errors`);
        // If some processed successfully, we might still want to trigger success
        if (result.processed > 0) {
          onSuccess();
        }
      } else {
        goeyToast.success(`Successfully imported ${result.processed} records!`);
        clearFile();
        onSuccess();
        onOpenChange(false);
      }
    } catch (error) {
      goeyToast.error("Import failed", {
        description: (error as Error).message,
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!isImporting) {
          onOpenChange(val);
          if (!val) clearFile();
        }
      }}
    >
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import Water Usages</DialogTitle>
          <DialogDescription>
            Upload an Excel/CSV file containing monthly water meter readings.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="period">Billing Period</Label>
              <Input
                id="period"
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-slate-500">
                The period these usages apply to (e.g. 2026-03).
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excel-file">Upload Excel/CSV File</Label>
              {!file ? (
                <label
                  htmlFor="excel-file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 mb-3 text-slate-400" />
                    <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      XLSX or CSV containing Unit ID, Previous Meter, Current
                      Meter
                    </p>
                  </div>
                  <input
                    id="excel-file"
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    className="hidden"
                    onChange={handleFileUpload}
                    disabled={isImporting}
                  />
                </label>
              ) : (
                <div className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-lg h-32">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-full">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(file.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={clearFile}
                    disabled={isImporting}
                    className="text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {errors.length > 0 && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl p-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 mt-0.5 mr-3 shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-rose-900 dark:text-rose-300 mb-2">
                    Found {errors.length} error(s) in the file
                  </h3>
                  <ul className="text-xs text-rose-700 dark:text-rose-400/80 list-disc pl-4 space-y-1">
                    {errors.map((error, idx) => (
                      <li key={idx}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {parsedData.length > 0 && errors.length === 0 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-medium text-slate-900 dark:text-white">
                  Preview ({parsedData.length} records)
                </h3>
                <Button
                  onClick={handleImport}
                  disabled={isImporting || !period}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {isImporting ? "Importing..." : "Confirm & Import"}
                </Button>
              </div>
              <div className="overflow-x-auto max-h-[400px]">
                <Table>
                  <TableHeader className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur z-10">
                    <TableRow>
                      <TableHead>Unit ID</TableHead>
                      <TableHead className="text-right">
                        Previous Meter
                      </TableHead>
                      <TableHead className="text-right">
                        Current Meter
                      </TableHead>
                      <TableHead className="text-right">Usage</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedData.map((row, idx) => {
                      const usage =
                        row["Current Meter"] - row["Previous Meter"];
                      return (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">
                            {row["Unit ID"]}
                          </TableCell>
                          <TableCell className="text-right">
                            {row["Previous Meter"]}
                          </TableCell>
                          <TableCell className="text-right">
                            {row["Current Meter"]}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400">
                            {usage}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
