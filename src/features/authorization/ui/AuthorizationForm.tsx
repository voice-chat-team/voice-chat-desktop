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
  ROUTES,
} from "@/shared";
import { useNavigate } from "react-router";

function AuthorizationForm() {
  const navigate = useNavigate();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Авторизация</CardTitle>
        <CardDescription>Войдите в свою учетную запись</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Электронная почта</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
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
                id="password"
                type="password"
                placeholder="••••••••"
                required
              />
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button
          type="submit"
          className="w-full"
          onClick={() => navigate(ROUTES.WELCOME)}
        >
          Войти
        </Button>
      </CardFooter>
    </Card>
  );
}

export default AuthorizationForm;
