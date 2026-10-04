import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "@/shared";
import { useRegistration } from "../hooks";
import type { RegistrationFormModel } from "../model/registration-request-dto.model";

interface RegistrationFormProps {
  onSuccess?: (email: string) => void;
}

export function RegistrationForm({ onSuccess }: RegistrationFormProps) {
  const {
    form: { register, handleSubmit, formState },
    onSubmit,
    isPending,
  } = useRegistration(onSuccess);

  const fieldError = (name: keyof RegistrationFormModel) =>
    formState.touchedFields[name] || formState.dirtyFields[name]
      ? formState.errors[name]?.message
      : undefined;

  const usernameError = fieldError("username");
  const emailError = fieldError("email");
  const passwordError = fieldError("password");
  const confirmPasswordError = fieldError("confirmPassword");

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>Регистрация</CardTitle>
          <CardDescription>Создайте новую учетную запись</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="username">Имя пользователя</Label>
            <Input
              {...register("username")}
              id="username"
              type="text"
              placeholder="TankistPro"
              autoComplete="username"
              aria-invalid={!!usernameError}
              required
            />
            <FieldError message={usernameError} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Электронная почта</Label>
            <Input
              {...register("email")}
              id="email"
              type="email"
              placeholder="m@example.com"
              autoComplete="email"
              aria-invalid={!!emailError}
              required
            />
            <FieldError message={emailError} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Пароль</Label>
            <Input
              {...register("password")}
              id="password"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!passwordError}
              required
            />
            <FieldError message={passwordError} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">Повторите пароль</Label>
            <Input
              {...register("confirmPassword")}
              id="confirmPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              aria-invalid={!!confirmPasswordError}
              required
            />
            <FieldError message={confirmPasswordError} />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button
            type="submit"
            className="w-full"
            disabled={!formState.isValid || isPending}
          >
            {isPending ? "Регистрация…" : "Зарегистрироваться"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

const FieldError = ({ message }: { message?: string }) =>
  message ? <p className="text-xs text-destructive">{message}</p> : null;
