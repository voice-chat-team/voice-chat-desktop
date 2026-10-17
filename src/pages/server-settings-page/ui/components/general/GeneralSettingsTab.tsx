import { railIconClass } from "@/widgets/side-bar-panel";
import {
  Button,
  cn,
  createAbbr,
  FormInput,
  getApiErrorMessage,
  getAvatarColorClass,
  FormTextarea,
  guildApi,
  SettingsSection,
  type GuildDto,
} from "@/shared";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Camera, Trash2, Upload } from "lucide-react";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  GeneralSettingsSchema,
  GUILD_DESCRIPTION_MAX_LENGTH,
  GUILD_NAME_MAX_LENGTH,
  type GeneralSettingsModel,
} from "../../../model";
import { UnsavedChangesBar } from "../UnsavedChangesBar";

// Название и описание сохраняются через PATCH /guild (остальные участники
// получают GUILD_UPDATED). Загрузки иконки на бэкенде пока нет — аватар
// остаётся только превью.
export const GeneralSettingsTab = ({ guild }: { guild: GuildDto }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const form = useForm<GeneralSettingsModel>({
    resolver: zodResolver(GeneralSettingsSchema),
    mode: "onChange",
    defaultValues: {
      name: guild.name,
      description: guild.description ?? "",
    },
  });

  const { errors, isDirty, isValid } = form.formState;
  const name = form.watch("name");
  const description = form.watch("description");

  useEffect(() => {
    return () => {
      if (iconPreview) URL.revokeObjectURL(iconPreview);
    };
  }, [iconPreview]);

  const openFilePicker = () => fileInputRef.current?.click();

  const handleIconChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setIconPreview(URL.createObjectURL(file));
    event.target.value = "";
  };

  const hasChanges = isDirty || iconPreview !== null;

  const resetChanges = () => {
    form.reset();
    setIconPreview(null);
  };

  const { mutate: save, isPending: isSaving } = useMutation({
    mutationFn: (values: GeneralSettingsModel) =>
      guildApi.guildControllerUpdateGuild({
        guildId: guild.id,
        name: values.name.trim(),
        description: values.description.trim(),
      }),
    onSuccess: (_, values) => {
      // Новое состояние формы — точка отсчёта для следующих правок.
      form.reset(values);
      setIconPreview(null);
      toast.success("Настройки сервера сохранены");
    },
    onError: (error) =>
      toast.error(
        getApiErrorMessage(error, "Не удалось сохранить настройки сервера"),
      ),
  });

  return (
    <form
      className="flex flex-col gap-6"
      onSubmit={form.handleSubmit((values) => save(values))}
      noValidate
    >
      <SettingsSection
        title="Аватар сервера"
        description="Показывается в списке серверов слева. Без изображения — первые буквы названия."
      >
        <div className="flex flex-wrap items-center gap-5">
          {/* Та же иконка, что у сервера в рейле (railIconClass): круг,
                  на hover — squircle, две буквы на цвете сервера. */}
          <button
            type="button"
            onClick={openFilePicker}
            aria-label="Изменить аватар сервера"
            className="group relative flex size-12 shrink-0 cursor-pointer items-center justify-center outline-none"
          >
            <span
              className={cn(
                railIconClass,
                "relative overflow-hidden",
                getAvatarColorClass(guild.id),
              )}
            >
              {iconPreview ? (
                <img
                  src={iconPreview}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                createAbbr(name.trim() || "?", 2)
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 [@media(hover:none)]:opacity-100">
                <Camera className="size-4 text-white" />
              </span>
            </span>
          </button>

          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="subtle"
                onClick={openFilePicker}
              >
                <Upload />
                Загрузить изображение
              </Button>
              <Button
                type="button"
                size="sm"
                variant="subtle"
                disabled={!iconPreview}
                onClick={() => setIconPreview(null)}
              >
                <Trash2 />
                Удалить
              </Button>
            </div>
            <p className="text-xs text-text-muted">
              Квадратное изображение от 256×256 пикселей. PNG, JPG или WebP, до
              5 МБ.
            </p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={handleIconChange}
        />
      </SettingsSection>

      <SettingsSection title="Название и описание">
        <div className="flex flex-col gap-1.5">
          <FormInput
            labelTitle="Название сервера"
            maxLength={GUILD_NAME_MAX_LENGTH}
            aria-invalid={!!errors.name}
            {...form.register("name")}
          />
          {errors.name && (
            <p className="text-xs text-status-dnd">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <FormTextarea
            labelTitle="Описание"
            placeholder="Расскажите, чем занимаются на сервере"
            rows={4}
            maxLength={GUILD_DESCRIPTION_MAX_LENGTH}
            aria-invalid={!!errors.description}
            className="resize-none"
            {...form.register("description")}
          />
          <div className="flex justify-between gap-4 text-xs">
            <span className="text-status-dnd">
              {errors.description?.message}
            </span>
            <span className="text-text-faint tabular-nums">
              {description.length} / {GUILD_DESCRIPTION_MAX_LENGTH}
            </span>
          </div>
        </div>
      </SettingsSection>

      {hasChanges && (
        <UnsavedChangesBar
          onReset={resetChanges}
          canSave={isValid && isDirty && !isSaving}
        />
      )}
    </form>
  );
};
