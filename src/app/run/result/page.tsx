import { Suspense } from "react";
import RunResultClient from "./RunResultClient";

export default function RunResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p>Loading...</p></div>}>
      <RunResultClient />
    </Suspense>
  );
}
