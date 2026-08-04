import { SubmitHandler, useForm } from "react-hook-form";
import {
  type LoginRequestDtoModel,
  LoginRequestDtoSchema,
} from "../model/login-request-dto.model";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { authApi, ROUTES, tokenStore } from "@/shared";
import { isAxiosError } from "axios";
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
      authApi.authControllerLogin(dto),
  });

  const onSubmit: SubmitHandler<LoginRequestDtoModel> = async (payload) => {
    mutateAsync(payload, {
      onSuccess: async (response) => {
        const { accessToken, refreshToken } = response.data;

        try {
          await tokenStore.setTokens(accessToken, refreshToken);
          navigate(ROUTES.WELCOME);
        } catch (e) {
          console.error("Failed to save tokens:", e);
        }
      },
      onError: (error) => {
        const message = isAxiosError(error)
          ? ((error.response?.data as { message?: string })?.message ??
            error.message)
          : error.message;

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
