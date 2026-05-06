"use client"

import * as React from "react"
// import { ChevronsUpDown, Plus } from "lucide-react"
import logo from "../../public/logo.png";
import favicon from "../../public/newfavicon.png";
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  // useSidebar,
} from "@/components/ui/sidebar"
import Image from "next/image"

export function TeamSwitcher({ }: {
  teams: {
    name: string
    logo: React.ElementType
    plan: string
  }[]
}) {
  // const { isMobile } = useSidebar()
  // const [activeTeam, setActiveTeam] = React.useState(teams[0])

  // if (!activeTeam) {
  //   return null
  // }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg text-sidebar-primary-foreground">
              <a className="" href="#">
                <Image alt="logo" width={200} src={favicon} />
              </a>
                {/* <activeTeam.logo className="size-4" /> */}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
              <Image alt="logo" width={150} src={logo} />
              </div>
            
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
