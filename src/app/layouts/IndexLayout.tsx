import { Toaster } from "@/shared/ui/sonner";
import { Outlet } from "react-router";

export const IndexLayout = () => {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
};
