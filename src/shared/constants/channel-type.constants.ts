/**
 * Именованный аналог ChannelDtoTypeEnum из сгенерированного клиента: генератор
 * теряет имена и отдаёт NUMBER_0 / NUMBER_1, по которым в компонентах ничего
 * не понять. Значения обязаны совпадать с contracts/proto/guilds.proto.
 */
export const CHANNEL_TYPE = {
  TEXT: 0,
  VOICE: 1,
} as const;

export type ChannelTypeValue =
  (typeof CHANNEL_TYPE)[keyof typeof CHANNEL_TYPE];
