import { Pencil } from "lucide-react";
import Link from "next/link";
import { Query } from "node-appwrite";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { createAdminClient } from "@/lib/appwrite/server";

export default async function UnitsPage() {
  const { databases } = await createAdminClient();

  // Fetch all units. Default limit is 25, we override to get all 384 units at once for this admin view.
  // In a real-world scenario with 10k+ rows we'd use pagination.
  const unitsData = await databases.listDocuments(
    "69a47644000b6bb85e41", // Replace with actual DB ID if abstracted
    "units",
    [Query.limit(500), Query.orderAsc("displayId")],
  );

  const units = unitsData.documents;

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Units Directory</h2>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Unit ID</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Occupancy</TableHead>
              <TableHead>Billing To</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <TableRow key={unit.$id}>
                <TableCell className="font-medium">{unit.displayId}</TableCell>
                <TableCell className="capitalize">{unit.unitType}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      unit.occupancyStatus === "vacant"
                        ? "destructive"
                        : unit.occupancyStatus === "owner_occupied"
                          ? "default"
                          : "secondary"
                    }
                  >
                    {unit.occupancyStatus.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="capitalize">
                  {unit.billRecipient}
                </TableCell>
                <TableCell className="text-right">
                  {/* Link to future /edit page component */}
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/units/${unit.$id}/edit`}>
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
