import { useGuildPermissions } from "@/entities/role";
import { useServerStore } from "@/entities/server";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  cn,
  createAbbr,
  getApiErrorMessage,
  getAvatarColorClass,
  guildApi,
  Label,
  removeGuildMember,
  ScrollArea,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useGuildMembers,
  useGuildRoles,
  type GuildMemberDto,
} from "@/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Crown, UserMinus } from "lucide-react";
import { toast } from "sonner";

const MemberListContent = ({ guildId }: { guildId: string }) => {
  const queryClient = useQueryClient();
  const { data: members } = useGuildMembers(guildId);
  const { data: roles } = useGuildRoles(guildId);
  const permissions = useGuildPermissions(guildId);

  const { mutate: kick, isPending: isKicking } = useMutation({
    mutationFn: (member: GuildMemberDto) =>
      guildApi.guildControllerKickMember({
        guildId,
        targetUserId: member.userId,
      }),
    onSuccess: (_, member) => {
      // Остальным это же прилетит событием GUILD_MEMBER_KICKED.
      removeGuildMember(queryClient, guildId, member.userId);
      toast.success(`${member.user.username} исключён с сервера`);
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, "Не удалось исключить участника")),
  });

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs leading-4 font-bold tracking-[0.04em] text-text-label uppercase">
        Участники — {members.length}
      </Label>
      <ScrollArea className="h-75 rounded-md border border-border-subtle bg-surface-200">
        <div className="p-1">
          {members.map((member) => {
            // roles — по убыванию позиции, поэтому и бейджи от старшей роли.
            const memberRoles = roles.filter(
              (role) => !role.isDefault && member.roleIds.includes(role.id),
            );

            return (
              <div
                key={member.userId}
                className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-surface-raised"
              >
                <Avatar size="lg">
                  {member.user.avatarUrl && (
                    <AvatarImage
                      src={member.user.avatarUrl}
                      alt={member.user.username}
                    />
                  )}
                  <AvatarFallback
                    className={cn(
                      "font-semibold text-text-on-brand",
                      getAvatarColorClass(member.userId),
                    )}
                  >
                    {createAbbr(member.user.username, 1)}
                  </AvatarFallback>
                </Avatar>
                <div className="w-full min-w-0">
                  <div className="flex items-center gap-2">
                    <p
                      className="truncate text-[15px] leading-5 font-semibold text-text-primary"
                      style={{ color: memberRoles[0]?.color }}
                    >
                      {member.user.username}
                    </p>
                    {member.isGuildOwner && (
                      <Crown
                        className="size-3.5 shrink-0 fill-current text-status-idle"
                        aria-label="Владелец сервера"
                      />
                    )}
                  </div>
                  {memberRoles.length > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {memberRoles.map((role) => (
                        <Badge
                          key={role.id}
                          variant="outline"
                          className="gap-1.5 border-border-subtle text-text-secondary"
                        >
                          <span
                            className="size-2 rounded-full"
                            style={{ backgroundColor: role.color }}
                          />
                          {role.name}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs leading-4 font-medium text-text-muted">
                      Присоединился{" "}
                      {new Date(member.joinedAt).toLocaleDateString("ru-RU")}
                    </p>
                  )}
                </div>
                {permissions.canKick(member) && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        disabled={isKicking}
                        className="shrink-0 text-status-dnd hover:bg-status-dnd/15! hover:text-status-dnd"
                        aria-label={`Исключить ${member.user.username}`}
                        onClick={() => kick(member)}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Исключить с сервера</p>
                    </TooltipContent>
                  </Tooltip>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export const MemberList = () => {
  const guildId = useServerStore((s) => s.state.guild?.id);

  if (!guildId) return null;

  return <MemberListContent guildId={guildId} />;
};
