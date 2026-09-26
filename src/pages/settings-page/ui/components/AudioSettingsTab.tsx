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
} from "@/shared";
import { Mic, Radio, Speaker } from "lucide-react";
import { useId, useState, type ReactNode } from "react";
import { SettingsSection } from "./SettingsSection";

const DEFAULT_DEVICE = "default";

type InputMode = "voice-activity" | "push-to-talk";

export const AudioSettingsTab = () => {
  const [inputDevice, setInputDevice] = useState(DEFAULT_DEVICE);
  const [outputDevice, setOutputDevice] = useState(DEFAULT_DEVICE);
  const [inputVolume, setInputVolume] = useState(100);
  const [outputVolume, setOutputVolume] = useState(100);
  const [inputMode, setInputMode] = useState<InputMode>("voice-activity");
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);
  const [autoGainControl, setAutoGainControl] = useState(true);

  return (
    <div className="flex flex-col gap-6">
      <SettingsSection
        title="Устройства"
        description="Выберите микрофон и динамики, которые будут использоваться в голосовых каналах."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <DeviceSelect
            label="Устройство ввода"
            icon={<Mic className="size-4" />}
            value={inputDevice}
            onValueChange={setInputDevice}
          />
          <DeviceSelect
            label="Устройство вывода"
            icon={<Speaker className="size-4" />}
            value={outputDevice}
            onValueChange={setOutputDevice}
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
        action={<Badge variant="secondary">Скоро</Badge>}
        className="opacity-50 select-none"
      >
        <div className="flex items-center gap-4">
          <Button type="button" variant="secondary" disabled>
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
  value: string;
  onValueChange: (value: string) => void;
};

const DeviceSelect = ({
  label,
  icon,
  value,
  onValueChange,
}: DeviceSelectProps) => {
  const id = useId();

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="flex items-center gap-2">
        {icon}
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={DEFAULT_DEVICE}>По умолчанию</SelectItem>
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
        <Label htmlFor={id}>{label}</Label>
        <span className="text-sm tabular-nums text-zinc-400">{value}%</span>
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
        "flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors",
        checked
          ? "border-primary/60 bg-primary/5"
          : "border-white/5 hover:bg-zinc-800/50",
      )}
    >
      <RadioGroupItem id={id} value={value} className="mt-0.5" />
      <div className="flex flex-col gap-1">
        <span className="flex items-center gap-2 font-medium text-white">
          {value === "push-to-talk" && <Radio className="size-4" />}
          {title}
        </span>
        <span className="text-sm font-normal text-zinc-400">
          {description}
        </span>
      </div>
    </Label>
  );
};
