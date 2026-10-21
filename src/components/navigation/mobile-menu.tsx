"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { href: "/search", label: "Find a home", hint: "Search across your campus market" },
  { href: "/roommates", label: "Find a roommate", hint: "Practical compatibility, your consent" },
  { href: "/how-it-works", label: "How it works", hint: "Search, verify, inspect, move" },
  { href: "/list-property", label: "List a property", hint: "For landlords and agents" },
  { href: "/report", label: "Report a listing", hint: "Tell us about a suspicious listing" },
  { href: "/support", label: "Support", hint: "Get help with your account" },
];

export function MobileMenu() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      </SheetTrigger>
      <SheetContent aria-label="Menu">
        <SheetHeader className="sr-only">
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription>Site navigation</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile" className="flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl px-3 py-3 transition-colors hover:bg-surface-1"
            >
              <span className="block text-sm font-medium text-ink-900">
                {link.label}
              </span>
              <span className="mt-0.5 block text-xs text-ink-400">{link.hint}</span>
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
