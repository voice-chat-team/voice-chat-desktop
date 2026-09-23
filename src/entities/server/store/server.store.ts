import { create } from "zustand";
import type { GuildDto } from "@/shared/api/generated/models/guild-dto";
import { BoardDto, ChannelDto } from "@/shared";

type GuildState = {
  state: {
    guild: GuildDto | null;
    activeTextChannel: ChannelDto | null;
    activeBoard: BoardDto | null;
  };
  actions: {
    setGuild: (guild: GuildDto | null) => void;
    setActiveTextChannel: (channel: ChannelDto | null) => void;
    setActiveBoard: (board: BoardDto | null) => void;
    resetActiveView: () => void;
  };
};

const initialState: GuildState["state"] = {
  guild: null,
  activeTextChannel: null,
  activeBoard: null,
};

export const useServerStore = create<GuildState>((set) => ({
  state: { ...initialState },
  actions: {
    setGuild: (guild) =>
      set((prev) => ({
        state: { ...prev.state, guild },
      })),
    // В центральной панели всегда ровно одна вьюха, поэтому выбор канала
    // снимает выбор доски и наоборот. Инвариант живёт здесь, в одном месте,
    // чтобы потребители стора об этом не думали.
    setActiveTextChannel: (activeTextChannel) =>
      set((prev) => ({
        state: { ...prev.state, activeTextChannel, activeBoard: null },
      })),
    setActiveBoard: (activeBoard) =>
      set((prev) => ({
        state: { ...prev.state, activeBoard, activeTextChannel: null },
      })),
    resetActiveView: () =>
      set((prev) => ({
        state: { ...prev.state, activeTextChannel: null, activeBoard: null },
      })),
  },
}));
