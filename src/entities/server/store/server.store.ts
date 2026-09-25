import { create } from "zustand";
import type { GuildDto } from "@/shared/api/generated/models/guild-dto";
import { BoardDto, ChannelDto } from "@/shared";

type GuildState = {
  state: {
    guild: GuildDto | null;
    activeTextChannel: ChannelDto | null;
    activeBoard: BoardDto | null;
    activeVoiceChannel: ChannelDto | null;
  };
  actions: {
    setGuild: (guild: GuildDto | null) => void;
    setActiveTextChannel: (channel: ChannelDto | null) => void;
    setActiveBoard: (board: BoardDto | null) => void;
    setActiveVoiceChannel: (channel: ChannelDto | null) => void;
    resetActiveView: () => void;
  };
};

const initialState: GuildState["state"] = {
  guild: null,
  activeTextChannel: null,
  activeBoard: null,
  activeVoiceChannel: null,
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
    //
    // Голосовая вьюха участвует в этом же инварианте, но само подключение к
    // голосу — нет: оно живёт в voice.store. Уйдя в текстовый канал, ты
    // остаёшься в разговоре, просто перестаёшь видеть плитки участников.
    setActiveTextChannel: (activeTextChannel) =>
      set((prev) => ({
        state: {
          ...prev.state,
          activeTextChannel,
          activeBoard: null,
          activeVoiceChannel: null,
        },
      })),
    setActiveBoard: (activeBoard) =>
      set((prev) => ({
        state: {
          ...prev.state,
          activeBoard,
          activeTextChannel: null,
          activeVoiceChannel: null,
        },
      })),
    setActiveVoiceChannel: (activeVoiceChannel) =>
      set((prev) => ({
        state: {
          ...prev.state,
          activeVoiceChannel,
          activeTextChannel: null,
          activeBoard: null,
        },
      })),
    resetActiveView: () =>
      set((prev) => ({
        state: {
          ...prev.state,
          activeTextChannel: null,
          activeBoard: null,
          activeVoiceChannel: null,
        },
      })),
  },
}));
