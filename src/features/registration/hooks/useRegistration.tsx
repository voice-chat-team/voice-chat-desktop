import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { authApi } from "@/shared";
import {
  type RegistrationFormModel,
  RegistrationFormSchema,
} from "../model/registration-request-dto.model";

// FIX: Вынести в /shared для переиспользования в проекте
const getErrorMessage = (error: unknown): string => {
  if (isAxiosError<{ message?: string | string[] }>(error)) {
    const message = error.response?.data?.message;
    if (Array.isArray(message) && message.length) return message[0];
    if (typeof message === "string" && message) return message;
  }

  return "Ошибка регистрации";
};

export const useRegistration = (onSuccess?: (email: string) => void) => {
  const form = useForm<RegistrationFormModel>({
    mode: "onChange",
    resolver: zodResolver(RegistrationFormSchema),
  });

  const { mutateAsync, isPending } = useMutation({
    mutationKey: ["registration-request"],
    mutationFn: ({ confirmPassword: _, ...dto }: RegistrationFormModel) =>
      authApi.authControllerRegistration(dto),
  });

  const onSubmit: SubmitHandler<RegistrationFormModel> = async (payload) => {
    mutateAsync(payload, {
      onSuccess: () => {
        toast.success("Аккаунт создан. Войдите в систему");
        onSuccess?.(payload.email);
      },
      onError: (error) => {
        toast.error(getErrorMessage(error), {
          id: "error-registration",
        });
      },
    });
  };

  return {
    form,
    onSubmit,
    isPending,
  };
};
