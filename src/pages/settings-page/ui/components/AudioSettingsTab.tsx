import {
  Badge,
  Button,
  cn,
  FormSwitch,
  Label,
  Progress,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  useMediaDevices,
} from "@/shared";
import { Mic, Radio, Speaker } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { SettingsSection } from "./SettingsSection";
import { useAudioSettingsStore } from "@/entities/voice";
import { toast } from "sonner";
import {
  type AudioDeviceKind,
  selectAudioDevice,
} from "@/features/voice-channel/model";

const DEFAULT_DEVICE = "default";

const fieldLabelClass =
  "flex items-center gap-2 text-xs leading-4 font-bold tracking-[0.04em] text-text-label uppercase";

type InputMode = "voice-activity" | "push-to-talk";

export const AudioSettingsTab = () => {
  const [inputVolume, setInputVolume] = useState(100);
  const [outputVolume, setOutputVolume] = useState(100);
  const [inputMode, setInputMode] = useState<InputMode>("voice-activity");
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [autoGainControl, setAutoGainControl] = useState(true);

  const { inputDevices, outputDevices, hasPermission, requestPermission } =
    useMediaDevices();
  const inputDeviceId = useAudioSettingsStore((s) => s.state.inputDeviceId);
  const outputDeviceId = useAudioSettingsStore((s) => s.state.outputDeviceId);

  const handleSelect = (kind: AudioDeviceKind) => (deviceId: string) =>
    selectAudioDevice(kind, deviceId).catch(() =>
      toast.error("Не удалось переключить устройство"),
    );

  return (
    <div className="flex flex-col gap-6">
      <SettingsSection
        title="Устройства"
        description="Выберите микрофон и динамики, которые будут использоваться в голосовых каналах."
        action={
          !hasPermission && (
            <Button type="button" variant="subtle" onClick={requestPermission}>
              Разрешить доступ к микрофону
            </Button>
          )
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <DeviceSelect
            label="Устройство ввода"
            icon={<Mic className="size-4" />}
            devices={inputDevices}
            value={inputDeviceId}
            onValueChange={handleSelect("audioinput")}
          />
          <DeviceSelect
            label="Устройство вывода"
            icon={<Speaker className="size-4" />}
            devices={outputDevices}
            value={outputDeviceId}
            onValueChange={handleSelect("audiooutput")}
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Громкость">
        <div className="grid gap-6 sm:grid-cols-2">
          <VolumeSlider
            label="Громкость микрофона"
            value={inputVolume}
            onValueChange={setInputVolume}
          />
          <VolumeSlider
            label="Громкость звука"
            value={outputVolume}
            onValueChange={setOutputVolume}
          />
        </div>
      </SettingsSection>

      <SettingsSection
        title="Проверка микрофона"
        description="Скажите что-нибудь — индикатор покажет уровень сигнала."
        action={
          <Badge className="bg-surface-raised text-text-secondary">Скоро</Badge>
        }
        className="opacity-50 select-none"
      >
        <div className="flex items-center gap-4">
          <Button type="button" variant="subtle" disabled>
            Проверить
          </Button>
          <Progress value={0} className="h-2" />
        </div>
      </SettingsSection>

      <SettingsSection title="Режим ввода">
        <RadioGroup
          value={inputMode}
          onValueChange={(value) => setInputMode(value as InputMode)}
          className="grid gap-3 sm:grid-cols-2"
        >
          <InputModeOption
            value="voice-activity"
            checked={inputMode === "voice-activity"}
            title="Активация по голосу"
            description="Микрофон включается, когда вы говорите."
          />
          <InputModeOption
            value="push-to-talk"
            checked={inputMode === "push-to-talk"}
            title="Push-to-talk"
            description="Микрофон работает, пока зажата клавиша."
          />
        </RadioGroup>
      </SettingsSection>

      <SettingsSection
        title="Обработка звука"
        description="Улучшает качество голоса в шумной обстановке."
      >
        <div className="flex flex-col gap-4">
          <FormSwitch
            switchTitle="Шумоподавление"
            checked={noiseSuppression}
            onCheckedChange={setNoiseSuppression}
          />
          <FormSwitch
            switchTitle="Эхоподавление"
            checked={echoCancellation}
            onCheckedChange={setEchoCancellation}
          />
          <FormSwitch
            switchTitle="Автоматическая регулировка усиления"
            checked={autoGainControl}
            onCheckedChange={setAutoGainControl}
          />
        </div>
      </SettingsSection>
    </div>
  );
};

type DeviceSelectProps = {
  label: string;
  icon: ReactNode;
  devices: MediaDeviceInfo[];
  value: string;
  onValueChange: (value: string) => void;
};

const DeviceSelect = ({
  label,
  icon,
  devices,
  value,
  onValueChange,
}: DeviceSelectProps) => {
  const id = useId();

  const available = devices.filter((d) => d.deviceId !== "");
  const hasDefault = available.some((d) => d.deviceId === DEFAULT_DEVICE);
  // Сохранённое устройство могли отключить — тогда показываем системное.
  const resolvedValue = available.some((d) => d.deviceId === value)
    ? value
    : DEFAULT_DEVICE;

  return (
    <div className="flex flex-col gap-2">
      <Label
        htmlFor={id}
        className={cn(fieldLabelClass, "[&_svg]:text-text-faint")}
      >
        {icon}
        {label}
      </Label>
      <Select
        value={resolvedValue}
        onValueChange={onValueChange}
        disabled={available.length === 0}
      >
        <SelectTrigger id={id} className="w-full">
          <SelectValue placeholder="Устройства недоступны" />
        </SelectTrigger>
        <SelectContent>
          {!hasDefault && (
            <SelectItem value={DEFAULT_DEVICE}>По умолчанию</SelectItem>
          )}
          {available.map((d) => (
            <SelectItem key={d.deviceId} value={d.deviceId}>
              {d.label || "Неизвестное устройство"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

type VolumeSliderProps = {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
};

const VolumeSlider = ({ label, value, onValueChange }: VolumeSliderProps) => {
  const id = useId();

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className={fieldLabelClass}>
          {label}
        </Label>
        <span className="text-sm text-text-muted tabular-nums">{value}%</span>
      </div>
      <Slider
        id={id}
        min={0}
        max={200}
        step={1}
        value={[value]}
        onValueChange={([next]) => onValueChange(next)}
      />
    </div>
  );
};

type InputModeOptionProps = {
  value: InputMode;
  checked: boolean;
  title: string;
  description: string;
};

const InputModeOption = ({
  value,
  checked,
  title,
  description,
}: InputModeOptionProps) => {
  const id = useId();

  return (
    <Label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-md border p-4 transition-colors",
        checked
          ? "border-brand/60 bg-brand/10"
          : "border-border-subtle hover:bg-surface-raised",
      )}
    >
      <RadioGroupItem id={id} value={value} className="mt-0.5" />
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-2 font-semibold text-text-primary">
          {value === "push-to-talk" && <Radio className="size-4" />}
          {title}
        </span>
        <span className="text-sm font-normal text-text-muted">
          {description}
        </span>
      </div>
    </Label>
  );
};
