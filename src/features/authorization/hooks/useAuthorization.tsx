import { SubmitHandler, useForm } from "react-hook-form";
import {
  type LoginRequestDtoModel,
  LoginRequestDtoSchema,
} from "../model/login-request-dto.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { login, ROUTES } from "@/shared";
import { useNavigate } from "react-router";
import { toast } from "sonner";

export const useAuthorization = () => {
  const navigate = useNavigate();

  const form = useForm<LoginRequestDtoModel>({
    mode: "onChange",
    resolver: zodResolver(LoginRequestDtoSchema),
  });

  const { mutateAsync } = useMutation({
    mutationKey: ["authrization-request"],
    mutationFn: async (dto: LoginRequestDtoModel) =>
      login(dto.email, dto.password),
  });

  const onSubmit: SubmitHandler<LoginRequestDtoModel> = async (payload) => {
    mutateAsync(payload, {
      onSuccess: async () => {
        navigate(ROUTES.WELCOME);
      },
      onError: (error) => {
        const message =
          typeof error === "string"
            ? error
            : error instanceof Error
              ? error.message
              : "Ошибка авторизации";

        toast.error(message, {
          id: "error-auth",
        });
      },
    });
  };

  return {
    form,
    onSubmit,
  };
};
