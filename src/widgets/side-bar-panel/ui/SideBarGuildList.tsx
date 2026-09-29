import {
  createAbbr,
  getAvatarColorClass,
  ROUTES,
  useUserServers,
} from "@/shared";
import { SideBarActionButton, SideBarInnerButton } from "./SideBarButton";

export const SideBarGuildList = () => {
  const { data: guilds, isError } = useUserServers();

  return (
    <>
      {!isError &&
        guilds?.map((guild) => (
          <SideBarActionButton key={guild.id} tooltipContent={guild.name}>
            <SideBarInnerButton
              to={ROUTES.SERVER(guild.id)}
              colorClassName={getAvatarColorClass(guild.id)}
            >
              {createAbbr(guild.name, 2)}
            </SideBarInnerButton>
          </SideBarActionButton>
        ))}
    </>
  );
};
