import { useServerStore } from "@/entities/server";
import {
  Avatar,
  AvatarFallback,
  Button,
  createAbbr,
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
      <Label>Участники - {members.length}</Label>
      <ScrollArea className="h-75 rounded-md border border-zinc-800 ">
        <div>
          {members.map((member) => (
            <div
              key={member.userId}
              className="flex items-center gap-3 p-2 rounded "
            >
              <Avatar size="lg">
                <AvatarFallback className="bg-violet-600 text-white">
                  {createAbbr(member.user.username, 1)}
                </AvatarFallback>
              </Avatar>
              <div className="w-full">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-white font-medium truncate">
                    {member.user.username}
                  </p>
                  {member.isGuildOwner && (
                    <Crown className=" text-yellow-500" size={16} />
                  )}
                </div>
                <p className="text-xs text-zinc-500">
                  Присоединился{" "}
                  {new Date(member.joinedAt).toLocaleDateString("ru-RU")}
                </p>
              </div>
              {!member.isGuildOwner && (
                <div className="flex items-center gap-2">
                  <Select value="member">
                    <SelectTrigger className="w-32 bg-zinc-800 border-zinc-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="member">Участник</SelectItem>
                      <SelectItem value="moderator">Модератор</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="text-red-500 "
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
