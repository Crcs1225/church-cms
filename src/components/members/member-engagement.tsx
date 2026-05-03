import { ArrowRight, Cake, HandHeart, Phone, CalendarDays } from "lucide-react";
import { Button, Card } from "@/components/ui";

const engagementItems = [
  {
    title: "Attended Sunday Service",
    detail: "2 days ago - Sanctuary A",
    icon: CalendarDays,
    className: "bg-orange-100 text-orange-700",
  },
  {
    title: "Volunteered: Soup Kitchen",
    detail: "1 week ago - Community Hall",
    icon: HandHeart,
    className: "bg-blue-100 text-blue-700",
  },
  {
    title: "Follow-up Call Completed",
    detail: "Oct 02, 2026 - Admin Office",
    icon: Phone,
    className: "bg-stone-100 text-stone-700",
  },
];

export function MemberEngagement() {
  return (
    <div className="space-y-6 lg:col-span-4">
      <section className="relative overflow-hidden rounded-lg border border-orange-200 bg-orange-50 p-6">
        <Cake
          className="absolute -top-4 -right-4 h-24 w-24 rotate-12 text-orange-100"
          aria-hidden
        />
        <div className="relative z-10">
          <h4 className="font-display text-xl text-orange-900">
            Birthday Celebration
          </h4>
          <p className="mb-4 text-sm text-orange-800/80">
            Elias is turning 66 in 12 days. Don&apos;t forget to send a
            congregational card.
          </p>
          <Button variant="ghost" className="text-orange-900">
            Create Message
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </section>

      <Card className="p-6">
        <h4 className="mb-4 font-display text-xl text-text-primary">
          Recent Engagement
        </h4>
        <div className="relative space-y-6 before:absolute before:top-2 before:bottom-2 before:left-3 before:w-px before:bg-border">
          {engagementItems.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="relative flex gap-4">
                <div
                  className={`z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white ${item.className}`}
                >
                  <Icon className="h-3 w-3" aria-hidden />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {item.title}
                  </p>
                  <p className="text-xs text-text-secondary">{item.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
