import type { Metadata } from "next";
import { SavedClient } from "./saved-client";

export const metadata: Metadata = {
  title: "Saved",
  description: "Your favourite places and saved date plans.",
};

export default function SavedPage() {
  return <SavedClient />;
}
