"use client";


// import {

//   useSidebar,
// } from "@/components/ui/sidebar";
// import { useAuth } from "@/context/context";
// import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  MoreVerticalIcon,
} from "lucide-react"
import {
  Avatar,
} from "@/components/ui/avatar"
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "./../ui/sidebar";
// import { useAuth } from "@/context/context";
// import { useRouter } from "next/navigation";
import Image from "next/image";

export function AdvertiserNavUser({
  user,
  svg,
}: {
  user: {
    name: string;
    publishersupport: string;
    email: string;
    team: string;
    telegram: string;
    avatar: string;
  };
  svg: {
    telegram: React.JSX.Element;  
    team: React.JSX.Element;   
  };
}) {
  const { isMobile } = useSidebar();
  // const auth = useAuth();
  // const route = useRouter();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="border-[#4f528e] text-white bg-[#4f528e] border shadow  "
            >
              <Avatar className="w-8 h-8 rounded-lg ">
              <Image width={80} height={80} src={user.avatar} alt={user.name} />

                {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
                {/* <AvatarFallback className="rounded-lg">CN</AvatarFallback> */}
              </Avatar>
              <div className="grid  flex-1 text-sm leading-tight text-left ">
                <span className="font-medium truncate">{user.publishersupport}</span>
                <span className="text-xs truncate ">
                  {user.name}
                </span>
              </div>
              <MoreVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="w-8 h-8 rounded-lg">
                  <Image width={80} height={80} src={user.avatar} alt={user.name} />
                  {/* <AvatarFallback className="rounded-lg">CN</AvatarFallback> */}
                </Avatar>
                <div className="grid flex-1 text-sm leading-tight text-left">
                  <span className="font-medium truncate">{user.publishersupport}</span>
                  <span className="text-xs truncate text-muted-foreground">
                    {user.name}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                {/* <UserCircleIcon /> */}
                {svg.team}
                <div
                  // onClick={() => route.push("/publisher/profile")}
                  className="flex items-center w-full gap-2 text-gray-700 rounded-md hover:bg-gray-100"
                >
                  {user.team}
                </div>

              </DropdownMenuItem>
              <DropdownMenuItem>
                {/* <UserCircleIcon /> */}
                {svg.telegram}

                <div
                  // onClick={() => route.push("/publisher/profile")}
                  className="flex items-center w-full gap-2 text-gray-700 rounded-md hover:bg-gray-100"
                >
                  {user.telegram}
                </div>

              </DropdownMenuItem>

            </DropdownMenuGroup>
            <DropdownMenuSeparator />

            {/* <DropdownMenuItem>
              <LogOutIcon />

              <button
                onClick={() => {
                  auth?.logout();
                }}
                className="flex items-center w-full gap-2 text-gray-700 rounded-md hover:bg-gray-100"
              >

                <span>Logout</span>
              </button>
            </DropdownMenuItem> */}

          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}