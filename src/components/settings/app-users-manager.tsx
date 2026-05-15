"use client";

import { useState, useTransition, type FormEvent } from "react";
import { Plus, Trash2, UserCog } from "lucide-react";
import { deleteAppUserAction, saveAppUserAction } from "@/app/admin/settings/actions";
import { Avatar, Badge, Button, Card, DeletionConfirmModal, Input, Label, Modal } from "@/components/ui";
import { APP_ROLE_OPTIONS } from "@/lib/app-roles";
import type { AppUserItem } from "@/lib/app-users";

type AppUsersManagerProps = {
  users: AppUserItem[];
};

const statusOptions = ["active", "inactive"];

export function AppUsersManager({ users }: AppUsersManagerProps) {
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AppUserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<AppUserItem | null>(null);
  const [isSavePending, startSaveTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startSaveTransition(async () => {
      const result = await saveAppUserAction(
        { status: "idle", message: null },
        formData,
      );

      if (result.status === "error") {
        setSaveError(result.message ?? "Unable to save admin user.");
        return;
      }

      setSaveError(null);
      setOpen(false);
      setEditingUser(null);
    });
  }

  return (
    <>
      <Card className="overflow-hidden rounded-xl p-0">
        <div className="flex flex-col gap-4 border-b border-border bg-surface-raised px-6 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-semibold text-text-primary">{users.length} Admin Users</p>
            <p className="text-sm text-text-secondary">
              Real admin records used for operational ownership and audit clarity.
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setEditingUser(null);
              setOpen(true);
            }}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Add User
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-background text-[11px] font-semibold tracking-widest text-text-secondary uppercase">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.publicId} className="transition-colors hover:bg-primary/5">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.fullName} />
                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-text-secondary">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge>{user.role}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={user.status === "active" ? "success" : "warning"}>
                      {user.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Edit ${user.fullName}`}
                        onClick={() => {
                          setEditingUser(user);
                          setOpen(true);
                        }}
                      >
                        <UserCog className="h-4 w-4" aria-hidden />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Delete ${user.fullName}`}
                        onClick={() => {
                          setDeletingUser(user);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-error" aria-hidden />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (!nextOpen) {
            setEditingUser(null);
          }
        }}
        title={editingUser ? "Edit Admin User" : "Add Admin User"}
        description="Manage the people who operate this admin console."
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => {
                setOpen(false);
                setEditingUser(null);
              }}
              disabled={isSavePending}
            >
              Cancel
            </Button>
            <Button type="submit" form="app-user-form" disabled={isSavePending}>
              {isSavePending ? "Saving..." : "Save User"}
            </Button>
          </>
        }
      >
        <form id="app-user-form" className="space-y-5" onSubmit={handleSubmit}>
          <input type="hidden" name="publicId" value={editingUser?.publicId ?? ""} />
          <div className="space-y-2">
            <Label htmlFor="app-user-name">Full Name</Label>
            <Input id="app-user-name" name="fullName" defaultValue={editingUser?.fullName ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="app-user-email">Email</Label>
            <Input
              id="app-user-email"
              name="email"
              type="email"
              defaultValue={editingUser?.email ?? ""}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="app-user-role">Role</Label>
              <select
                id="app-user-role"
                name="role"
                aria-label="Select admin user role"
                title="Select admin user role"
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-base outline-none focus:border-primary focus:ring-3 focus:ring-focus-ring"
                defaultValue={editingUser?.role ?? "Admin"}
              >
                {APP_ROLE_OPTIONS.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="app-user-status">Status</Label>
              <select
                id="app-user-status"
                name="status"
                aria-label="Select admin user status"
                title="Select admin user status"
                className="h-10 w-full rounded-md border border-border bg-surface px-3 text-base outline-none focus:border-primary focus:ring-3 focus:ring-focus-ring"
                defaultValue={editingUser?.status ?? "active"}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {saveError ? (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {saveError}
            </p>
          ) : null}
        </form>
      </Modal>

      <DeletionConfirmModal
        open={deletingUser !== null}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setDeletingUser(null);
          }
        }}
        title="Delete Admin User"
        itemLabel={deletingUser?.fullName ?? "this admin user"}
        confirmLabel="Delete User"
        isSubmitting={isDeletePending}
        error={deleteError}
        onConfirm={() => {
          if (!deletingUser) {
            return;
          }

          const formData = new FormData();
          formData.set("publicId", deletingUser.publicId);
          startDeleteTransition(async () => {
            const result = await deleteAppUserAction(
              { status: "idle", message: null },
              formData,
            );

            if (result.status === "error") {
              setDeleteError(result.message ?? "Unable to delete admin user.");
              return;
            }

            setDeleteError(null);
            setDeletingUser(null);
          });
        }}
      />
    </>
  );
}
