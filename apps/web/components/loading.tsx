import { Loader } from "lucide-react";

export function Loading() {
  return (
    <div className="flex h-full min-h-screen w-full items-center justify-center">
      <Loader className="size-6 animate-spin" />
    </div>
  );
}
