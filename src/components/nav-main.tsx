"use client"

import {
  ChevronDownIcon,
  ChevronRightIcon,
  type LucideIcon,
} from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

type NavItem = {
  title: string
  url: string
  icon?: LucideIcon
  items?: NavItem[] // 👈 support for subitems
}

export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname() ?? ""

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2 px-4 overflow-x-hidden">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            {/* <SidebarMenuButton
              tooltip="Quick Create"
              className="duration-200 ease-linear min-w-8 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground"
            >
              <PlusCircleIcon />
              <span>Quick Create</span>
            </SidebarMenuButton> */}
            {/* <Button
              size="icon"
              className="h-9 w-9 shrink-0 group-data-[collapsible=icon]:opacity-0"
              variant="outline"
            >
              <MailIcon />
              <span className="sr-only">Inbox</span>
            </Button> */}
          </SidebarMenuItem>
        </SidebarMenu>

        {/* Recursive Menu Rendering */}
        <SidebarMenu>
          {items.map((item) => (
            <NavMenuItem key={item.title} item={item} pathname={pathname} />
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

// Recursive Component for Menu Items
function NavMenuItem({
  item,
  pathname,
}: {
  item: NavItem
  pathname: string | null
}) {
  const [open, setOpen] = useState(false)

  const currentPath = pathname ?? ""
  const isActive = Boolean(item.url && currentPath === item.url)
  const isChildActive = Boolean(
    item.items && item.items.some((sub) => Boolean(sub.url && currentPath === sub.url))
  )
  const isParentActive = isActive || isChildActive

  const activeButtonClass =
    "bg-gray-200  text-gray-900 font-semibold  border-l-4 border-[#6a6bcf]"
  const inactiveButtonClass = "text-gray-700 hover:bg-gray-50"

  if (item.items && item.items.length > 0) {
    return (
      <div className="w-full">
        <SidebarMenuItem
          onClick={() => setOpen(!open)}
          className="cursor-pointer"
        >
          <SidebarMenuButton
            tooltip={item.title}
            className={`rounded-md ${isParentActive ? activeButtonClass : inactiveButtonClass}`}
          >
            {item.icon && <item.icon />}
            <span className="flex-1">{item.title}</span>
            {open ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
          </SidebarMenuButton>
        </SidebarMenuItem>

        {open && (
          <div className="pl-3 ml-4 space-y-1 border-l">
            {item.items.map((subItem) => (
              <NavMenuItem
                key={subItem.title}
                item={subItem}
                pathname={pathname}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link href={item.url}>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={item.title}
          className={`rounded-md ${isActive ? activeButtonClass : inactiveButtonClass}`}
        >
          {item.icon && <item.icon />}
          <span>{item.title}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </Link>
  )
}