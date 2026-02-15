import { HeroSection } from "@/components/landing/hero-section"
import { UniqueValue } from "@/components/landing/unique-value"
import { ServicesSection } from "@/components/landing/services-section"
import { PropertyTypes } from "@/components/landing/property-types"
import { FeaturedProperties } from "@/components/landing/featured-properties"
import { HowItWorks } from "@/components/landing/how-it-works"
import { ExplanatoryVideos } from "@/components/landing/explanatory-videos"
import { Testimonials } from "@/components/landing/testimonials"
import { AboutSection } from "@/components/landing/about-section"
import { ContactSection } from "@/components/landing/contact-section"

export default function HomePage() {
  return (
    <>
      
      <HeroSection />
      <FeaturedProperties/>
      <UniqueValue />
      <ServicesSection />
      <PropertyTypes />      
      <HowItWorks />
      <ExplanatoryVideos />
      <Testimonials />
      {/* <AboutSection /> */}
      {/* <ContactSection /> */}
    </>
  )
}
