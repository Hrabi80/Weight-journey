"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { createPortal } from "react-dom";

import { Box, Flex } from "../layout";
import { Button } from "../ui/button";

type NavLink = {
  href: string;
  label: string;
  variant: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
};

type MobileNavProps = {
  navLinks: NavLink[];
  portalId: string;
};

export function MobileNav({ navLinks, portalId }: MobileNavProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [portalEl, setPortalEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setPortalEl(document.getElementById(portalId));
  }, [portalId]);

  const toggleMenu = () => setIsMenuOpen((open) => !open);
  const closeMenu = () => setIsMenuOpen(false);

  const menuContent = (
    <Box
      className={`sm:hidden overflow-hidden border-t border-border/60 bg-background/90 backdrop-blur-md transition-[max-height,opacity] duration-200 ${
        isMenuOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
      }`}
      aria-hidden={!isMenuOpen}
    >
      <Flex direction="column" gap="xs" className="container mx-auto py-3" px="md">
        {navLinks.map(({ href, label, variant }) => (
          <Button
            key={href}
            variant={variant}
            className="justify-start text-base"
            
            onClick={closeMenu}
          >
            <Link href={href} className="flex w-full items-center gap-2">
              {label}
            </Link>
          </Button>
        ))}
      </Flex>
    </Box>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="sm:hidden"
        aria-expanded={isMenuOpen}
        aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
        onClick={toggleMenu}
      >
        {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {portalEl ? createPortal(menuContent, portalEl) : null}
    </>
  );
}
