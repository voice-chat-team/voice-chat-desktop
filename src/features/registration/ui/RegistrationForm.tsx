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

export function RegistrationForm() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Регистрация</CardTitle>
        <CardDescription>Создайте новую учетную запись</CardDescription>
      </CardHeader>
      <CardContent>
        <form>
          <div className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Имя пользователя</Label>
              <Input
                id="username"
                type="text"
                placeholder="TasnkistPro"
                required
              />
            </div>
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
          Зарегистрироваться
        </Button>
      </CardFooter>
    </Card>
  );
}
