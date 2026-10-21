"use client";

import Link from "next/link";
import {
  Bell,
  ChevronDown,
  ClipboardList,
  Heart,
  LayoutDashboard,
  LogOut,
  UserRound,
  CalendarCheck,
  ShieldCheck,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOutAction } from "@/features/authentication/actions";
import { initials } from "@/lib/utils";

interface AuthMenuProps {
  user: {
    name: string;
    email: string | null;
    avatarUrl: string | null;
    isProvider: boolean;
    isStaff: boolean;
  } | null;
}

export function AuthMenu({ user }: AuthMenuProps) {
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
          <Link href="/login">Sign in</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/register">Get started</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-full border border-line-soft bg-surface-2 py-1 pl-1 pr-2.5 shadow-e1 transition-colors hover:bg-surface-1"
          aria-label="Account menu"
        >
          <Avatar className="size-8">
            {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt="" />}
            <AvatarFallback>{initials(user.name)}</AvatarFallback>
          </Avatar>
          <span className="hidden max-w-28 truncate text-sm font-medium text-ink-700 sm:block">
            {user.name.split(" ")[0]}
          </span>
          <ChevronDown className="size-3.5 text-ink-400" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <span className="block normal-case tracking-normal text-sm font-medium text-ink-900">
            {user.name}
          </span>
          {user.email && (
            <span className="block truncate normal-case tracking-normal text-xs font-normal text-ink-400">
              {user.email}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard">
            <LayoutDashboard className="size-4" /> Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/saved">
            <Heart className="size-4" /> Saved homes
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/enquiries">
            <ClipboardList className="size-4" /> My enquiries
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/inspections">
            <CalendarCheck className="size-4" /> Inspections
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/notifications">
            <Bell className="size-4" /> Notifications
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <UserRound className="size-4" /> Profile
          </Link>
        </DropdownMenuItem>
        {user.isProvider && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/provider/dashboard">
                <LayoutDashboard className="size-4" /> Provider dashboard
              </Link>
            </DropdownMenuItem>
          </>
        )}
        {user.isStaff && (
          <DropdownMenuItem asChild>
            <Link href="/admin/dashboard">
              <ShieldCheck className="size-4" /> Administration
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={signOutAction} className="w-full">
            <button type="submit" className="flex w-full items-center gap-2">
              <LogOut className="size-4" /> Sign out
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
