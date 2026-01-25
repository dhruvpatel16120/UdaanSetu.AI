import { Suspense } from "react";
import { AuthSlider } from "@/components/auth/AuthSlider";

export default function AuthIndexPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthSlider />
    </Suspense>
  );
}
