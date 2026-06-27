import { create } from "zustand";
import type { GuildDto } from "@/shared/api/generated/models/guild-dto";

type ServerState = {
  guild: GuildDto | null;
  setGuild: (guild: GuildDto | null) => void;
};

export const useServerStore = create<ServerState>((set) => ({
  guild: null,
  setGuild: (guild) => set({ guild }),
}));
