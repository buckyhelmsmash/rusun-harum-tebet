"use client";

import { use } from "react";

export default function ResidentInvoicePortal({
  params,
}: {
  params: Promise<{ accessToken: string }>;
}) {
  const unwrappedParams = use(params);

  return (
    <div className="min-h-screen bg-muted/30 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">Resident Invoice Portal</h1>
        <p className="text-muted-foreground">
          Access token: {unwrappedParams.accessToken}
        </p>
        <p>Please enter your KTP to view full invoice details.</p>
      </div>
    </div>
  );
}
