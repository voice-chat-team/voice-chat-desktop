import { LogoutButton } from "@/features/logout";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  createAbbr,
  FormInput,
  useCurrentUser,
} from "@/shared";
import { Camera, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { SettingsSection } from "./SettingsSection";

export const AccountSettingsTab = () => {
  const { data: user } = useCurrentUser();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!user) return;
    setUsername(user.username);
    setEmail(user.email);
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setAvatarPreview(URL.createObjectURL(file));
    event.target.value = "";
  };

  const openFilePicker = () => fileInputRef.current?.click();

  const avatarSrc = avatarPreview ?? user?.avatarUrl;
  const isProfileDirty =
    !!user && (username !== user.username || email !== user.email);

  const resetProfile = () => {
    if (!user) return;
    setUsername(user.username);
    setEmail(user.email);
  };

  return (
    <div className="flex flex-col gap-6">
      <SettingsSection title="Профиль">
        <div className="overflow-hidden rounded-lg border border-white/5">
          <div className="h-24 bg-linear-to-r from-indigo-500/60 via-violet-500/50 to-fuchsia-500/40" />
          <div className="flex flex-wrap items-end justify-between gap-4 bg-zinc-900 px-4 pb-4">
            <div className="flex items-end gap-4">
              <button
                type="button"
                onClick={openFilePicker}
                aria-label="Изменить аватар"
                className="group/avatar-upload relative -mt-10 rounded-full ring-6 ring-zinc-900 cursor-pointer"
              >
                <Avatar size="extra">
                  {avatarSrc && <AvatarImage src={avatarSrc} />}
                  <AvatarFallback className="text-2xl font-semibold">
                    {createAbbr(user?.username ?? "", 1)}
                  </AvatarFallback>
                </Avatar>
                <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity group-hover/avatar-upload:opacity-100">
                  <Camera className="size-6 text-white" />
                </span>
              </button>
              <div className="flex flex-col pb-1">
                <p className="text-lg font-semibold text-white">
                  {user?.username}
                </p>
                <p className="text-sm text-zinc-400">{user?.email}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" size="sm" onClick={openFilePicker}>
                <Upload />
                Загрузить аватар
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                disabled={!avatarPreview}
                onClick={() => setAvatarPreview(null)}
              >
                <Trash2 />
                Удалить
              </Button>
            </div>
          </div>
        </div>
        <p className="text-xs text-zinc-500">
          Рекомендуемый размер — не менее 256×256 пикселей. PNG или JPG, до 5
          МБ.
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </SettingsSection>

      <SettingsSection
        title="Личные данные"
        description="Эти данные видят другие участники серверов."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormInput
            labelTitle="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
          <FormInput
            labelTitle="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            disabled={!isProfileDirty}
            onClick={resetProfile}
          >
            Отменить
          </Button>
          <Button type="button" disabled={!isProfileDirty}>
            Сохранить изменения
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Пароль"
        description="Используйте не менее 8 символов, включая цифры и буквы."
      >
        <div className="grid gap-4">
          <FormInput
            labelTitle="Текущий пароль"
            type="password"
            autoComplete="current-password"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              labelTitle="Новый пароль"
              type="password"
              autoComplete="new-password"
            />
            <FormInput
              labelTitle="Подтвердите пароль"
              type="password"
              autoComplete="new-password"
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button type="button" variant="secondary">
            Изменить пароль
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection
        title="Выход из аккаунта"
        description="Завершить сеанс на этом устройстве. Для входа потребуется снова ввести логин и пароль."
        className="border-red-900/40 bg-red-950/10"
        action={<LogoutButton />}
      />
    </div>
  );
};
