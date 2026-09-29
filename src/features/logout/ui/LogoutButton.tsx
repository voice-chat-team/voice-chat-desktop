import { Button, ROUTES } from "@/shared";
import { logout } from "@/shared/api/auth-commands";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router";

export const LogoutButton = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await logout();
    queryClient.clear();
    navigate(ROUTES.AUTHORIZATION);
  };

  return (
    <Button
      onClick={handleLogout}
      variant="subtle"
      className="border-status-dnd/60 text-status-dnd hover:border-status-dnd hover:bg-status-dnd hover:text-text-on-brand"
    >
      <LogOut className="w-4 h-4 mr-2" />
      Выйти из аккаунта
    </Button>
  );
};
