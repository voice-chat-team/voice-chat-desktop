import { Button, ROUTES, Separator } from "@/shared";
import { ArrowLeft, LogOut } from "lucide-react";
import { Link } from "react-router";

export const SettingsAsideSection = () => {
  return (
    <aside className="h-svh p-2 flex flex-col justify-between overflow-y-hidden">
      <Link
        to={ROUTES.WELCOME}
        className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </Link>
      <div className="flex flex-col gap-2">
        <Separator />

        <Button
          variant="default"
          className="bg-transparent border-red-800 text-red-400 hover:bg-red-700/50 hover:text-red-300 hover:border-red-700"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Выйти из аккаунта
        </Button>
      </div>
    </aside>
  );
};
