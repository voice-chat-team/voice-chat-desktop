import { useServerStore } from "@/entities/server";
import {
  Avatar,
  AvatarFallback,
  Button,
  cn,
  createAbbr,
  getAvatarColorClass,
  Label,
  ScrollArea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useGuildMembers,
} from "@/shared";
import { Crown, UserMinus } from "lucide-react";

export const MemberList = () => {
  const guild = useServerStore((s) => s.state.guild);

  if (!guild) return null;

  const { data: members } = useGuildMembers(guild.id);

  return (
    <div className="flex flex-col gap-2">
      <Label className="text-xs leading-4 font-bold tracking-[0.04em] text-text-label uppercase">
        Участники — {members.length}
      </Label>
      <ScrollArea className="h-75 rounded-md border border-border-subtle bg-surface-200">
        <div className="p-1">
          {members.map((member) => (
            <div
              key={member.userId}
              className="flex items-center gap-3 rounded-md p-2 transition-colors hover:bg-surface-raised"
            >
              <Avatar size="lg">
                <AvatarFallback
                  className={cn(
                    "font-semibold text-text-on-brand",
                    getAvatarColorClass(member.userId),
                  )}
                >
                  {createAbbr(member.user.username, 1)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 w-full">
                <div className="flex items-center gap-2">
                  <p className="truncate text-[15px] leading-5 font-semibold text-text-primary">
                    {member.user.username}
                  </p>
                  {member.isGuildOwner && (
                    <Crown className="size-3.5 shrink-0 fill-current text-status-idle" />
                  )}
                </div>
                <p className="text-xs leading-4 font-medium text-text-muted">
                  Присоединился{" "}
                  {new Date(member.joinedAt).toLocaleDateString("ru-RU")}
                </p>
              </div>
              {!member.isGuildOwner && (
                <div className="flex items-center gap-2">
                  <Select value="member">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="member">Участник</SelectItem>
                      <SelectItem value="moderator">Модератор</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-status-dnd hover:bg-status-dnd/15! hover:text-status-dnd"
                    aria-label="Исключить участника"
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};
