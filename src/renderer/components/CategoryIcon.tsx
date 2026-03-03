import React from "react";

const ICON_EMOJI_MAP: Record<string, string> = {
  "shopping-cart": "🛒",
  utensils: "🍽️",
  car: "🚗",
  taxi: "🚕",
  home: "🏠",
  bolt: "⚡",
  smartphone: "📱",
  wifi: "📶",
  package: "📦",
  shirt: "👕",
  pill: "💊",
  hospital: "🏥",
  "spray-can": "🧴",
  film: "🎬",
  "play-circle": "▶️",
  gift: "🎁",
  plane: "✈️",
  dumbbell: "🏋️",
  wrench: "🔧",
  "circle-help": "❔",

  wallet: "💼",
  banknote: "💵",
  laptop: "💻",
  "building-2": "🏢",
  coins: "🪙",
  "rotate-ccw": "↩️",

  target: "🎯",
  landmark: "🏦",
  "credit-card": "💳"
};

export function getCategoryEmoji(iconName?: string) {
  if (!iconName) return "🏷️";
  return ICON_EMOJI_MAP[iconName] ?? "🏷️";
}

export function CategoryIcon({
  iconName,
  className = ""
}: {
  iconName?: string;
  className?: string;
}) {
  const emoji = getCategoryEmoji(iconName);

  return (
    <span className={`category-emoji ${className}`.trim()} aria-hidden="true">
      {emoji}
    </span>
  );
}