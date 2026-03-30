"use client";

import { redirect, useParams } from "next/navigation";

export default function Page() {
  const { workspace } = useParams();
  redirect(`/${workspace}/my-issues`);
  return null;
}
