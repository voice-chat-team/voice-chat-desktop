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
import { AuthAppLogo } from "./AuthAppLogo";

export function AuthorizationForm() {
  return (
    <div className="flex flex-col gap-6 max-w-md w-full ">
      <AuthAppLogo />
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Авторизация</CardTitle>
          <CardDescription>Войдите в свою учетную запись</CardDescription>
        </CardHeader>
        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
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
          <Button type="submit" className="w-full">
            Войти
          </Button>
          <Button type="submit" variant="outline" className="w-full">
            Создать аккаунт
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
