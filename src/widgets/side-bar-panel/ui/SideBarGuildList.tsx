import { createAbbr, ROUTES, useUserServers } from "@/shared";
import { SideBarActionButton, SideBarInnerButton } from "./SideBarButton";

export const SideBarGuildList = () => {
  const { data: guilds, isError } = useUserServers();

  return (
    <>
      {!isError &&
        guilds?.map((guild) => (
          <SideBarActionButton key={guild.id} tooltipContent={guild.name}>
            <SideBarInnerButton to={ROUTES.SERVER(guild.id)}>
              <p className="font-medium">{createAbbr(guild.name, 2)}</p>
            </SideBarInnerButton>
          </SideBarActionButton>
        ))}
    </>
  );
};
