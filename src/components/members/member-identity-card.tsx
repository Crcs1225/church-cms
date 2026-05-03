import { Cake, Mail, MapPin, Phone } from "lucide-react";
import { Avatar, Badge, Card } from "@/components/ui";

type MemberIdentityCardProps = {
  name: string;
  email: string;
  phone: string;
  birthday: string;
  address: string;
  statusLabel: string;
};

export function MemberIdentityCard({
  name,
  email,
  phone,
  birthday,
  address,
  statusLabel,
}: MemberIdentityCardProps) {
  return (
    <Card className="relative col-span-1 flex flex-col gap-6 overflow-hidden p-6 md:col-span-8 md:flex-row">
      <div className="absolute top-0 bottom-0 left-0 w-1 bg-primary" />
      <Avatar name={name} className="h-32 w-32 rounded-lg text-3xl" />
      <div className="flex flex-1 flex-col justify-center">
        <div className="mb-3 flex flex-wrap items-center gap-3">
          <h2 className="font-display text-3xl text-text-primary">{name}</h2>
          <Badge className="bg-primary-fixed text-primary">{statusLabel}</Badge>
        </div>
        <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
          <div className="flex items-center gap-2 text-text-secondary">
            <Mail className="h-4 w-4" aria-hidden />
            <span className="text-sm">{email}</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <Cake className="h-4 w-4" aria-hidden />
            <span className="text-sm">{birthday}</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <Phone className="h-4 w-4" aria-hidden />
            <span className="text-sm">{phone}</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <MapPin className="h-4 w-4" aria-hidden />
            <span className="text-sm">{address}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
