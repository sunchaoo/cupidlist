// Deterministic initials avatar with a soft, friendly gradient per name.

const GRADIENTS = [
  "from-cupid-400 to-cupid-600",
  "from-indigoSoft-400 to-indigoSoft-600",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-600",
  "from-violet-400 to-indigoSoft-500",
  "from-teal-400 to-emerald-500",
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase() || "?";
}

function gradientFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31;
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${gradientFor(
        name
      )} font-semibold text-white`}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </span>
  );
}
