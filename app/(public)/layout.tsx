import type React from "react"
import { Navbar } from "@/components/landing/navbar"
import { NavbarWrapper } from "@/components/landing/navbar-wrapper"
import { Footer } from "@/components/landing/footer"

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <NavbarWrapper>
        <Navbar />
      </NavbarWrapper>
      {children}
      <Footer />
    </>
  )
}
