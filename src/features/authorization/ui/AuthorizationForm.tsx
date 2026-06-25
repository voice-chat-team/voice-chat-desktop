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
import { useAuthorization } from "../hooks";

export function AuthorizationForm() {
  const {
    form: { register, handleSubmit, formState },
    onSubmit,
  } = useAuthorization();

  return (
    <Card className="w-full">
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardHeader>
          <CardTitle>Авторизация</CardTitle>
          <CardDescription>Войдите в свою учетную запись</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Электронная почта</Label>
            <Input
              {...register("email", { required: true })}
              id="email"
              type="email"
              placeholder="m@example.com"
              autoComplete="off"
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Пароль</Label>
              <a
                href="#"
                className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
              >
                Забыл пароль?
              </a>
            </div>
            <Input
              {...register("password", { required: true })}
              id="password"
              type="password"
              autoComplete="off"
              placeholder="••••••••"
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <Button className="w-full" disabled={!formState.isValid}>
            Войти
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
