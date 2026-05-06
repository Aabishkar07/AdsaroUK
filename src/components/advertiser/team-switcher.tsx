"use client"

import * as React from "react"
// import { ChevronsUpDown, Plus } from "lucide-react"
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

export function AdvertiserTeamSwitcher({ }: {
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
              <div className="grid flex-1 text-left text-sm leading-tight" />
            
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
