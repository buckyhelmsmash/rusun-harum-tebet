"use client";

import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { account } from "@/lib/appwrite/client";
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
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7));
  const [parsedData, setParsedData] = useState<ExcelImportRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      const session = await account.createJWT();
      const res = await fetch("/api/water-usages/template", {
        headers: {
          Authorization: `Bearer ${session.jwt}`,
        },
      });
      if (!res.ok) throw new Error("Failed to download template");
      const rawBlob = await res.blob();
      const blob = new Blob([rawBlob], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "water-usages-template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      goeyToast.error("Download failed", {
        description: (err as Error).message,
      });
    } finally {
      setIsDownloading(false);
    }
  };

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

      const rawJson = xlsx.utils.sheet_to_json(worksheet) as Record<
        string,
        unknown
      >[];

      // Skip unfilled template rows (empty meter values)
      const filledRows = rawJson.filter(
        (row) =>
          row["Unit ID"] != null &&
          String(row["Unit ID"]).trim() !== "" &&
          row["Previous Meter"] != null &&
          String(row["Previous Meter"]).trim() !== "" &&
          row["Current Meter"] != null &&
          String(row["Current Meter"]).trim() !== "",
      );

      if (filledRows.length === 0) {
        setErrors(["No filled rows found. Please fill in the meter readings."]);
        setParsedData([]);
        return;
      }

      const validationResult = z
        .array(excelImportRowSchema)
        .safeParse(filledRows);

      if (!validationResult.success) {
        setErrors([
          "Invalid file format. Ensure columns exact match: 'Unit ID', 'Previous Meter', 'Current Meter'.",
        ]);
        setParsedData([]);
        return;
      }

      const validRows = validationResult.data;
      const validationErrors: string[] = [];

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
    } catch {
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
      const session = await account.createJWT();
      const response = await fetch("/api/water-usages/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.jwt}`,
        },
        body: JSON.stringify({ period, rows: parsedData }),
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

  const hasPreview = parsedData.length > 0 && errors.length === 0;

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
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 gap-0">
        {/* Header with gradient accent */}
        <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-sky-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-sky-950/20 px-6 pt-6 pb-5 border-b border-slate-200 dark:border-slate-800">
          <DialogHeader className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0">
                <FileSpreadsheet className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg">
                  Import Water Usages
                </DialogTitle>
                <DialogDescription className="text-sm mt-0.5">
                  Upload monthly water meter readings via Excel or CSV.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Download template inline CTA */}
          <div className="mt-4 flex items-center gap-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-lg px-3.5 py-2.5 border border-blue-100 dark:border-blue-900/40">
            <Download className="h-4 w-4 text-blue-500 shrink-0" />
            <p className="text-xs text-slate-600 dark:text-slate-400 flex-1">
              Need the template?{" "}
              <button
                type="button"
                onClick={handleDownloadTemplate}
                disabled={isDownloading}
                className="text-blue-600 dark:text-blue-400 font-semibold hover:underline underline-offset-2 disabled:opacity-50 inline-flex items-center gap-1"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Generating…
                  </>
                ) : (
                  "Download template"
                )}
              </button>{" "}
              <span className="text-slate-400 dark:text-slate-500">
                — pre-filled with all current units.
              </span>
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Step 1: Period + File */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-bold shrink-0">
                1
              </span>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Select period & file
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Period picker */}
              <div className="space-y-1.5">
                <label
                  htmlFor="period"
                  className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  Billing Period
                </label>
                <Input
                  id="period"
                  type="month"
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-11"
                />
              </div>

              {/* File upload */}
              <div className="space-y-1.5">
                <label
                  htmlFor="excel-file"
                  className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  Excel / CSV File
                </label>
                {!file ? (
                  <label
                    htmlFor="excel-file"
                    className="group flex items-center gap-3 w-full h-11 px-3 border border-dashed border-slate-300 dark:border-slate-600 rounded-md cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:border-blue-400 hover:bg-blue-50/50 dark:hover:border-blue-700 dark:hover:bg-blue-950/20 transition-all"
                  >
                    <UploadCloud className="h-4 w-4 text-slate-400 group-hover:text-blue-500 transition-colors shrink-0" />
                    <span className="text-sm text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      Choose file…
                    </span>
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
                  <div className="flex items-center gap-2 h-11 px-3 border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/20 rounded-md">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                        {file.name}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={clearFile}
                      disabled={isImporting}
                      className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-medium text-rose-800 dark:text-rose-300">
                    {errors.length} error{errors.length > 1 ? "s" : ""} found
                  </p>
                  <ul className="text-xs text-rose-600 dark:text-rose-400/80 list-disc pl-4 space-y-0.5">
                    {errors.map((errorMsg) => (
                      <li key={errorMsg}>{errorMsg}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {hasPreview && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center h-5 w-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold shrink-0">
                  2
                </span>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Review & confirm
                </h3>
                <span className="ml-auto text-xs text-slate-400">
                  {parsedData.length} record{parsedData.length > 1 ? "s" : ""}
                </span>
              </div>

              {/* Desktop preview table */}
              <div className="hidden sm:block border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-[280px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-slate-50/95 dark:bg-slate-800/95 backdrop-blur z-10">
                      <TableRow>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                          Unit
                        </TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-right text-slate-500">
                          Prev
                        </TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-right text-slate-500">
                          Current
                        </TableHead>
                        <TableHead className="text-xs font-semibold uppercase tracking-wider text-right text-slate-500">
                          Usage
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {parsedData.map((row) => {
                        const usage =
                          row["Current Meter"] - row["Previous Meter"];
                        return (
                          <TableRow
                            key={row["Unit ID"]}
                            className="hover:bg-slate-50 dark:hover:bg-slate-800/50"
                          >
                            <TableCell className="font-semibold text-sm text-slate-900 dark:text-white">
                              {row["Unit ID"]}
                            </TableCell>
                            <TableCell className="text-right text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                              {row["Previous Meter"].toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right text-sm text-slate-600 dark:text-slate-400 tabular-nums">
                              {row["Current Meter"].toLocaleString()}
                            </TableCell>
                            <TableCell className="text-right text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                              {usage.toLocaleString()} m³
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Mobile preview cards */}
              <div className="sm:hidden space-y-2 max-h-[280px] overflow-y-auto">
                {parsedData.map((row) => {
                  const usage = row["Current Meter"] - row["Previous Meter"];
                  return (
                    <div
                      key={row["Unit ID"]}
                      className="flex items-center justify-between gap-3 px-3 py-2.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {row["Unit ID"]}
                        </p>
                        <p className="text-xs text-slate-400">
                          {row["Previous Meter"].toLocaleString()} →{" "}
                          {row["Current Meter"].toLocaleString()}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 tabular-nums shrink-0">
                        {usage.toLocaleString()} m³
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer — always visible */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => {
              clearFile();
              onOpenChange(false);
            }}
            disabled={isImporting}
            className="sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={isImporting || !period || !hasPreview}
            className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50 sm:w-auto"
          >
            {isImporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Uploading…
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4 mr-2" />
                Upload{hasPreview ? ` (${parsedData.length})` : ""}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
