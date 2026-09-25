import { LogoutButton } from "@/features/logout";
import { ROUTES, Separator } from "@/shared";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router";

export const SettingsAsideSection = () => {
  return (
    <aside className="bg-zinc-900 h-svh p-2 flex flex-col justify-between overflow-y-hidden">
      <Link
        to={ROUTES.WELCOME}
        className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </Link>
      <div className="flex flex-col gap-2">
        <Separator />
        <LogoutButton />
      </div>
    </aside>
  );
};
