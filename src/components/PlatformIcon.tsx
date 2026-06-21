import { Instagram, Facebook, MessageCircle, UserRound } from "lucide-react";
import type { Platform } from "@/lib/types";

const MAP: Record<
  Platform,
  { Icon: typeof Instagram; label: string; className: string }
> = {
  instagram: { Icon: Instagram, label: "Instagram", className: "text-pink-500" },
  facebook: { Icon: Facebook, label: "Facebook", className: "text-blue-600" },
  whatsapp: { Icon: MessageCircle, label: "WhatsApp", className: "text-green-500" },
  manual: { Icon: UserRound, label: "Manual", className: "text-slate-400" },
};

export function PlatformIcon({
  platform,
  size = 16,
  withLabel = false,
}: {
  platform: Platform;
  size?: number;
  withLabel?: boolean;
}) {
  const { Icon, label, className } = MAP[platform];
  return (
    <span className="inline-flex items-center gap-1.5" title={label}>
      <Icon size={size} className={className} aria-hidden />
      {withLabel && <span className="text-xs text-slate-500">{label}</span>}
    </span>
  );
}
