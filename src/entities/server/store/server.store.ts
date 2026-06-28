import { create } from "zustand";
import type { GuildDto } from "@/shared/api/generated/models/guild-dto";
// import { ChannelDto } from "@/shared";

type GuildState = {
  state: {
    guild: GuildDto | null;
  };
  actions: {
    setGuild: (guild: GuildDto | null) => void;
  };
};

const initialState: GuildState["state"] = {
  guild: null,
};

export const useServerStore = create<GuildState>((set) => ({
  state: { ...initialState },
  actions: {
    setGuild: (guild) =>
      set({
        state: {
          guild,
        },
      }),
  },
}));
