"use client";
// Example for your page file (e.g., src/app/page.tsx)
import dynamic from "next/dynamic";

const ThreeBody = dynamic(() => import("@/components/ThreeBody"), { ssr: false });

export default function Home() {
  return <ThreeBody />;
}