import { Mic2 } from "lucide-react";

export function WelcomeUpSection() {
  return (
    <div className="max-w-96">
      <div className="flex flex-col items-center gap-4 justify-center ">
        <div className="bg-violet-600 p-4 rounded-full">
          <Mic2 className=" text-white" size={45} strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-center">
          Добро пожаловать в VoiceChat !
        </h2>
        <small className="text-center text-sm text-secondary leading-normal">
          Выберите сервер из списка слева или создайте новую для начала
          голосового общения
        </small>
      </div>
    </div>
  );
}
