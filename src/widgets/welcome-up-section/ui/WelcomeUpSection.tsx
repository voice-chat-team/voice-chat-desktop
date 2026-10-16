import { CreateNewServerModal } from "@/features";
import {
  Button,
  ErrorBoundary,
  useCurrentUser,
  useUserServers,
} from "@/shared";
import { Skeleton } from "@/shared/ui/skeleton";
import { Plus } from "lucide-react";
import { Suspense, useState } from "react";
import { Voiceprint } from "./Voiceprint";
import {
  WelcomeServerList,
  WelcomeServerListSkeleton,
} from "./WelcomeServerList";
import { WelcomeVoiceSession } from "./WelcomeVoiceSession";

function getGreeting(date = new Date()) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) return "Доброе утро";
  if (hour >= 12 && hour < 18) return "Добрый день";
  if (hour >= 18 && hour < 23) return "Добрый вечер";
  return "Доброй ночи";
}

/** Волна тише, пока у пользователя нет ни одного сервера. */
function WelcomeVoiceprint({ seed }: { seed: string }) {
  const { data: guilds } = useUserServers();

  return <Voiceprint seed={seed} isQuiet={!guilds?.length} />;
}

export function WelcomeUpSection() {
  const { data: currentUser } = useCurrentUser();
  const [isOpenCreateServerModal, setIsOpenCreateServerModal] = useState(false);

  const voiceprintFallback = <Voiceprint seed="" isQuiet />;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
      <header className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-[clamp(2rem,6vw,3.5rem)] leading-[1.05] font-semibold tracking-[-0.035em] text-text-primary">
            {getGreeting()},
            <br />
            {currentUser ? (
              <span className="break-words">{currentUser.username}</span>
            ) : (
              <Skeleton className="mt-2 inline-block h-[0.9em] w-48 align-middle" />
            )}
          </h1>
          <p className="max-w-md text-[15px] leading-relaxed text-text-secondary">
            Выберите сервер, чтобы продолжить разговор.
          </p>
        </div>

        {currentUser ? (
          <ErrorBoundary fallback={<Voiceprint seed={currentUser.id} />}>
            <Suspense fallback={voiceprintFallback}>
              <WelcomeVoiceprint seed={currentUser.id} />
            </Suspense>
          </ErrorBoundary>
        ) : (
          voiceprintFallback
        )}
      </header>

      <WelcomeVoiceSession />

      <section
        className="flex flex-col gap-4"
        aria-labelledby="welcome-servers"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2
            id="welcome-servers"
            className="text-lg font-semibold text-text-primary"
          >
            Ваши серверы
          </h2>
          <Button
            variant="brand"
            size="lg"
            onClick={() => setIsOpenCreateServerModal(true)}
          >
            <Plus />
            Создать сервер
          </Button>
        </div>

        <ErrorBoundary
          fallback={
            <p className="text-sm text-text-secondary">
              Не удалось загрузить серверы. Они по-прежнему доступны в панели
              слева.
            </p>
          }
        >
          <Suspense fallback={<WelcomeServerListSkeleton />}>
            <WelcomeServerList />
          </Suspense>
        </ErrorBoundary>
      </section>

      <CreateNewServerModal
        open={isOpenCreateServerModal}
        onOpenChange={setIsOpenCreateServerModal}
      />
    </div>
  );
}
