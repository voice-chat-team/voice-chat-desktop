import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AxiosResponse } from "axios";

import {
  currentUserQueryKey,
  guildMembersQueryKey,
  guildRolesQueryKey,
  removeGuildMember,
  removeRoleFromGuildMembers,
  setGuildRoles,
  upsertGuildMembers,
  upsertGuildRole,
  userServersQueryKey,
  type GetMeResponseDto,
  type GetUserGuildsResponseDto,
  type GuildDto,
  type GuildMemberDto,
  type RoleDto,
} from "@/shared";
import { useCentrifuge } from "@/shared/lib";

type GuildRoleEvent =
  | { type: "ROLE_CREATED"; payload?: { role?: RoleDto; roles?: RoleDto[] } }
  | { type: "ROLE_UPDATED"; payload?: { role?: RoleDto } }
  | { type: "ROLE_DELETED"; payload?: { roleId?: string; roles?: RoleDto[] } }
  | { type: "ROLES_REORDERED"; payload?: { roles?: RoleDto[] } }
  | { type: "MEMBER_ROLES_UPDATED"; payload?: { members?: GuildMemberDto[] } }
  | {
      type: "GUILD_MEMBER_KICKED";
      payload?: { guildId?: string; userId?: string };
    }
  | { type: "GUILD_UPDATED"; payload?: { guild?: GuildDto } };

type GuildRoleEventHandlers = {
  onGuildUpdated?: (guild: GuildDto) => void;
  /** Исключили текущего пользователя. */
  onKicked?: () => void;
};

/**
 * Роли, состав ролей участников, исключения и настройки сервера из канала
 * guild:{guildId}. Пишет прямо в кэш ролей и участников.
 */
export const useGuildRoleEvents = (
  guildId: string,
  handlers: GuildRoleEventHandlers = {},
) => {
  const queryClient = useQueryClient();
  const centrifuge = useCentrifuge();

  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const channel = `guild:${guildId}`;

    const sub =
      centrifuge.getSubscription(channel) ??
      centrifuge.newSubscription(channel);

    let isFirstSubscribe = true;

    const handlePublication = (ctx: { data?: unknown }) => {
      const event = (ctx.data ?? {}) as Partial<GuildRoleEvent>;

      switch (event.type) {
        case "ROLE_CREATED":
        case "ROLES_REORDERED": {
          const roles = event.payload?.roles;
          if (roles) setGuildRoles(queryClient, guildId, roles);
          return;
        }

        case "ROLE_UPDATED": {
          const role = event.payload?.role;
          if (role?.guildId === guildId) upsertGuildRole(queryClient, role);
          return;
        }

        case "ROLE_DELETED": {
          const { roleId, roles } = event.payload ?? {};
          if (roles) setGuildRoles(queryClient, guildId, roles);
          if (roleId) removeRoleFromGuildMembers(queryClient, guildId, roleId);
          return;
        }

        case "MEMBER_ROLES_UPDATED": {
          const members = event.payload?.members;
          if (members?.length) upsertGuildMembers(queryClient, guildId, members);
          return;
        }

        case "GUILD_MEMBER_KICKED": {
          const userId = event.payload?.userId;
          if (!userId || event.payload?.guildId !== guildId) return;

          removeGuildMember(queryClient, guildId, userId);

          const me = queryClient.getQueryData<GetMeResponseDto>(
            currentUserQueryKey,
          );
          if (me?.id === userId) {
            void queryClient.invalidateQueries({
              queryKey: userServersQueryKey,
            });
            handlersRef.current.onKicked?.();
          }
          return;
        }

        case "GUILD_UPDATED": {
          const guild = event.payload?.guild;
          if (guild?.id !== guildId) return;

          queryClient.setQueryData(
            userServersQueryKey,
            (old: AxiosResponse<GetUserGuildsResponseDto> | undefined) =>
              old && {
                ...old,
                data: {
                  ...old.data,
                  guilds: old.data.guilds.map((g) =>
                    g.id === guild.id ? guild : g,
                  ),
                },
              },
          );
          handlersRef.current.onGuildUpdated?.(guild);
        }
      }
    };

    const handleSubscribed = () => {
      // За время разрыва могли пропустить события — перечитываем.
      if (!isFirstSubscribe) {
        void queryClient.invalidateQueries({
          queryKey: guildRolesQueryKey(guildId),
        });
        void queryClient.invalidateQueries({
          queryKey: guildMembersQueryKey(guildId),
        });
      }

      isFirstSubscribe = false;
    };

    sub.on("publication", handlePublication);
    sub.on("subscribed", handleSubscribed);

    sub.subscribe();

    // Снимаем только свои обработчики: на канал подписаны и другие хуки.
    return () => {
      sub.off("publication", handlePublication);
      sub.off("subscribed", handleSubscribed);
      sub.unsubscribe();
    };
  }, [centrifuge, guildId, queryClient]);
};
