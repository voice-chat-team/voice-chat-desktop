import type { GuildRole } from "@/entities/role";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Checkbox,
  cn,
  createAbbr,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  FormInput,
  getAvatarColorClass,
  ScrollArea,
  type GuildMemberDto,
} from "@/shared";
import { useState } from "react";

type AddRoleMembersDialogProps = {
  role: GuildRole;
  guildMembers: GuildMemberDto[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (userIds: string[]) => void;
};

export const AddRoleMembersDialog = ({
  role,
  guildMembers,
  open,
  onOpenChange,
  onAdd,
}: AddRoleMembersDialogProps) => {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const inRole = new Set(role.members.map((m) => m.id));
  const normalizedQuery = query.trim().toLowerCase();
  const candidates = guildMembers.filter(
    (m) =>
      !inRole.has(m.userId) &&
      m.user.username.toLowerCase().includes(normalizedQuery),
  );

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setQuery("");
      setSelected(new Set());
    }
    onOpenChange(next);
  };

  const toggle = (userId: string, checked: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (checked) next.add(userId);
      else next.delete(userId);
      return next;
    });

  const submit = () => {
    onAdd([...selected]);
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить участников</DialogTitle>
          <DialogDescription>
            Роль «{role.name.trim() || "Без названия"}» достанется выбранным
            участникам после сохранения изменений.
          </DialogDescription>
        </DialogHeader>

        <FormInput
          type="search"
          placeholder="Найти участника"
          aria-label="Найти участника"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <ScrollArea className="h-72 rounded-md border border-border-subtle bg-surface-200">
          {candidates.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-text-muted">
              {normalizedQuery
                ? `Нет участников по запросу «${query.trim()}».`
                : "Роль уже есть у всех участников сервера."}
            </p>
          ) : (
            <ul className="flex flex-col p-1">
              {candidates.map((member) => {
                const id = `add-role-member-${member.userId}`;

                return (
                  <li key={member.userId}>
                    <label
                      htmlFor={id}
                      className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-surface-raised"
                    >
                      <Checkbox
                        id={id}
                        checked={selected.has(member.userId)}
                        onCheckedChange={(checked) =>
                          toggle(member.userId, checked === true)
                        }
                      />
                      <Avatar size="sm">
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
                      <span className="min-w-0 flex-1 truncate text-[15px] font-medium text-text-primary">
                        {member.user.username}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>

        <DialogFooter>
          <Button
            type="button"
            variant="subtle"
            onClick={() => handleOpenChange(false)}
          >
            Отмена
          </Button>
          <Button
            type="button"
            variant="brand"
            disabled={selected.size === 0}
            onClick={submit}
          >
            Добавить{selected.size > 0 && ` (${selected.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
