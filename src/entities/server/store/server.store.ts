import { create } from "zustand";
import type { GuildDto } from "@/shared/api/generated/models/guild-dto";
import { ChannelDto } from "@/shared";

type GuildState = {
  state: {
    guild: GuildDto | null;
    activeTextChannel: ChannelDto | null;
  };
  actions: {
    setGuild: (guild: GuildDto | null) => void;
    setActiveTextChannel: (channel: ChannelDto | null) => void;
  };
};

const initialState: GuildState["state"] = {
  guild: null,
  activeTextChannel: null
};

export const useServerStore = create<GuildState>((set) => ({
  state: { ...initialState },
  actions: {
    setGuild: (guild) =>
      set((prev) => ({
        state: { ...prev.state, guild },
      })),
    setActiveTextChannel: (activeTextChannel) =>
      set((prev) => ({
        state: { ...prev.state, activeTextChannel },
      })),
  },
}));
