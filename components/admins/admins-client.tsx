"use client";

import { Loader2, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { useAuth } from "@/contexts/auth-context";
import {
  useDeleteAdmin,
  useGetAdmins,
  useInviteAdmin,
} from "@/hooks/api/use-admins";

export function AdminsClient() {
  const { user: currentUser } = useAuth();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const { data: admins = [], isLoading: loading } = useGetAdmins();
  const inviteMutation = useInviteAdmin();
  const deleteMutation = useDeleteAdmin();

  const onSubmitInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes("@")) {
      goeyToast.error("Format email tidak valid");
      return;
    }

    try {
      await inviteMutation.mutateAsync({ email: inviteEmail });
      goeyToast.success("Admin berhasil diundang");
      setIsInviteOpen(false);
      setInviteEmail("");
    } catch {
      goeyToast.error("Gagal mengundang admin");
    }
  };

  const handleRemove = async (id: string) => {
    if (id === currentUser?.$id) {
      goeyToast.error("Anda tidak dapat menghapus akses Anda sendiri");
      return;
    }

    try {
      await deleteMutation.mutateAsync(id);
      goeyToast.success("Akses admin berhasil dicabut");
    } catch {
      goeyToast.error("Gagal menghapus admin");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kelola Admin</h1>
          <p className="text-muted-foreground">
            Manajemen daftar admin yang dapat mengakses sistem ini.
          </p>
        </div>
        <Button onClick={() => setIsInviteOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Undang Admin
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
            <CardTitle>Daftar Pengurus (Admin)</CardTitle>
          </div>
          <CardDescription>
            Superadmin memiliki kontrol penuh, sedangkan Admin dapat mengelola
            data harian.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {admins.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      Belum ada admin.
                    </TableCell>
                  </TableRow>
                ) : (
                  admins.map((admin) => {
                    const isSuperadmin = admin.labels.includes("superadmin");
                    const roleBadge = isSuperadmin ? (
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                        Superadmin
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                        Admin
                      </span>
                    );

                    return (
                      <TableRow key={admin.$id}>
                        <TableCell className="font-medium">
                          {admin.name || "-"}
                        </TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>{roleBadge}</TableCell>
                        <TableCell className="text-right">
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                disabled={
                                  admin.$id === currentUser?.$id ||
                                  (deleteMutation.isPending &&
                                    deleteMutation.variables === admin.$id)
                                }
                              >
                                {deleteMutation.isPending &&
                                deleteMutation.variables === admin.$id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Cabut Akses Admin?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  Apakah Anda yakin ingin mencabut akses admin
                                  ini? Pengguna tidak akan bisa lagi mengakses
                                  dashboard ini.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-red-500 text-white hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700"
                                  onClick={() => handleRemove(admin.$id)}
                                >
                                  Ya, Cabut Akses
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Undang Admin Baru</DialogTitle>
            <DialogDescription>
              Admin yang diundang akan mendapatkan akses login ke dashboard.
              Undangan akan dikirim ke email mereka.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmitInvite} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Alamat Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInviteOpen(false)}
                disabled={inviteMutation.isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending}>
                {inviteMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Kirim Undangan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
