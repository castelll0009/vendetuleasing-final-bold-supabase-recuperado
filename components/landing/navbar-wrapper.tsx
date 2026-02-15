"use client"

import React from "react"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

interface NavbarWrapperProps {
  children: React.ReactNode
}

export function NavbarWrapper({ children }: NavbarWrapperProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const pathname = usePathname()

  const isLandingPage = pathname === "/"

  useEffect(() => {
    if (!isLandingPage) return

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [isLandingPage])

  const childrenWithProps = React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child as React.ReactElement<any>, {
        isTransparent: isLandingPage && !isScrolled,
      })
    }
    return child
  })

  return <>{childrenWithProps}</>
}
