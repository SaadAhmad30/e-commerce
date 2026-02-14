import { redirect } from "next/navigation";

// Root page redirects to the store home
export default function RootPage() {
  redirect("/");
}
