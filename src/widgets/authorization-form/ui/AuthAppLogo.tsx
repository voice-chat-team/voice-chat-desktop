import { Mic2 } from "lucide-react";

export function AuthAppLogo() {
  return (
    <div className="flex items-center gap-3 justify-center">
      <div className="bg-violet-600 p-3 rounded-xl">
        <Mic2 className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-4xl font-bold text-white">VoiceChat</h1>
    </div>
  );
}
