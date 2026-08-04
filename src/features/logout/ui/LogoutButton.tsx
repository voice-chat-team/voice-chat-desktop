import { Button, ROUTES } from "@/shared";
import { tokenStore } from "@/shared/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";

export const LogoutButton = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await tokenStore.clear();
    queryClient.clear();
    navigate(ROUTES.AUTHORIZATION);
  };

  return (
    <Button
      onClick={handleLogout}
      variant="default"
      className="bg-transparent border-red-800 text-red-400 hover:bg-red-700/50 hover:text-red-300 hover:border-red-700"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Выйти из аккаунта
    </Button>
  );
};
