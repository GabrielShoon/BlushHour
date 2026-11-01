import type { Metadata } from "next";
import { Builder } from "./builder";

export const metadata: Metadata = {
  title: "Date builder",
  description: "Arrange your stops, set timings and see the route and total cost of your date.",
};

export default function PlanPage() {
  return <Builder />;
}
