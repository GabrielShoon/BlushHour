import type { Category, CategoryId, Occasion, Vibe } from "@/lib/types";

export const CATEGORIES: Category[] = [
  { id: "romantic", label: "Romantic", kind: "activity", icon: "Heart", hue: "rose" },
  { id: "unique", label: "Unique experiences", kind: "activity", icon: "Sparkle", hue: "plum" },
  { id: "active", label: "Active & adventurous", kind: "activity", icon: "PersonSimpleRun", hue: "apricot" },
  { id: "games", label: "Games & play", kind: "activity", icon: "GameController", hue: "sky" },
  { id: "creative", label: "Creative & hands-on", kind: "activity", icon: "PaintBrush", hue: "gold" },
  { id: "relaxing", label: "Relaxing", kind: "activity", icon: "Leaf", hue: "sage" },
  { id: "museums", label: "Museums", kind: "activity", icon: "Bank", hue: "plum" },
  { id: "photobooths", label: "Photobooths", kind: "activity", icon: "Camera", hue: "rose" },
  { id: "outdoors", label: "Free & outdoors", kind: "activity", icon: "Tree", hue: "sage" },
  { id: "dining", label: "Date-night dining", kind: "food", icon: "ForkKnife", hue: "apricot" },
  { id: "casual", label: "Casual dining", kind: "food", icon: "BowlFood", hue: "sage" },
  { id: "bars", label: "Bars", kind: "food", icon: "Martini", hue: "plum" },
  { id: "cafes", label: "Cafés", kind: "food", icon: "Coffee", hue: "gold" },
  { id: "desserts", label: "Desserts", kind: "food", icon: "IceCream", hue: "rose" },
  { id: "supper", label: "Supper", kind: "food", icon: "MoonStars", hue: "sky" },
];

export const CATEGORY_BY_ID = Object.fromEntries(CATEGORIES.map((c) => [c.id, c])) as Record<
  CategoryId,
  Category
>;

export const VIBES: { id: Vibe; label: string }[] = [
  { id: "romantic", label: "Romantic" },
  { id: "playful", label: "Playful" },
  { id: "chill", label: "Chill" },
  { id: "adventurous", label: "Adventurous" },
  { id: "creative", label: "Creative" },
  { id: "fancy", label: "Fancy" },
  { id: "foodie", label: "Foodie" },
  { id: "lowkey", label: "Low-key" },
];

export const OCCASIONS: { id: Occasion; label: string }[] = [
  { id: "first-date", label: "First date" },
  { id: "anniversary", label: "Anniversary" },
  { id: "birthday", label: "Birthday" },
  { id: "rainy-day", label: "Rainy day" },
  { id: "weekend", label: "Weekend" },
  { id: "spontaneous", label: "Spontaneous" },
];

export const BUDGETS = [
  { id: "under-50", label: "Under $50 pp" },
  { id: "50-150", label: "$50–150 pp" },
  { id: "150-300", label: "$150–300 pp" },
  { id: "splurge", label: "Splurge" },
] as const;

export const PRICE_LABEL = ["Free", "$", "$$", "$$$", "$$$$"] as const;
