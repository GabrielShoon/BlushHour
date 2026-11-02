import {
  Bank,
  BowlFood,
  Camera,
  Coffee,
  ForkKnife,
  GameController,
  Heart,
  IceCream,
  Leaf,
  Martini,
  MoonStars,
  PaintBrush,
  PersonSimpleRun,
  Sparkle,
  Tree,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";
import { CATEGORY_BY_ID } from "@/data/categories";
import type { Category, CategoryId } from "@/lib/types";

const ICONS: Record<string, Icon> = {
  Bank,
  BowlFood,
  Camera,
  Coffee,
  ForkKnife,
  GameController,
  Heart,
  IceCream,
  Leaf,
  Martini,
  MoonStars,
  PaintBrush,
  PersonSimpleRun,
  Sparkle,
  Tree,
};

export function CategoryIcon({
  id,
  size = 20,
  weight = "duotone",
  className,
}: {
  id: CategoryId;
  size?: number;
  weight?: "regular" | "duotone" | "fill" | "bold";
  className?: string;
}) {
  const I = ICONS[CATEGORY_BY_ID[id].icon] ?? Sparkle;
  return <I size={size} weight={weight} className={className} aria-hidden />;
}

/** Background tint classes per hue; text stays ink for contrast. */
export const HUE_BG: Record<Category["hue"], string> = {
  rose: "bg-[color-mix(in_oklab,var(--rose)_22%,var(--surface))]",
  apricot: "bg-[color-mix(in_oklab,var(--apricot)_45%,var(--surface))]",
  plum: "bg-[color-mix(in_oklab,var(--plum)_45%,var(--surface))]",
  sage: "bg-[color-mix(in_oklab,var(--sage)_50%,var(--surface))]",
  sky: "bg-[color-mix(in_oklab,var(--sky)_50%,var(--surface))]",
  gold: "bg-[color-mix(in_oklab,var(--gold)_50%,var(--surface))]",
};

export const HUE_VAR: Record<Category["hue"], string> = {
  rose: "var(--rose)",
  apricot: "var(--apricot)",
  plum: "var(--plum)",
  sage: "var(--sage)",
  sky: "var(--sky)",
  gold: "var(--gold)",
};
