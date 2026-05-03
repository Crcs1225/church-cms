import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminShell } from "@/components/admin";
import { Avatar } from "@/components/ui";
import { MemberForm } from "./member-form";

export function NewMemberPage() {
  return (
    <AdminShell activeSection="Members" showQuickCreate={false}>
      <div className="sticky top-16 z-30 border-b border-border bg-background/85 px-6 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/members"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-text-secondary transition-colors hover:bg-surface-raised hover:text-text-primary"
              aria-label="Back to members"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden />
            </Link>
            <h1 className="font-display text-xl text-primary">Add New Member</h1>
          </div>
          <Avatar name="Admin User" />
        </div>
      </div>

      <main className="mx-auto max-w-[1200px] px-6 py-8">
        <MemberForm />
      </main>
    </AdminShell>
  );
}
