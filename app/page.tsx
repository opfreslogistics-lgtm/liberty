'use client'

import { useEffect, useState } from 'react'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import HeroSection from '@/components/homepage/HeroSection'
import StatsSection from '@/components/homepage/StatsSection'
import ServicesSection from '@/components/homepage/ServicesSection'
import FeaturesSection from '@/components/homepage/FeaturesSection'
import AboutSection from '@/components/homepage/AboutSection'
import SolutionsSection from '@/components/homepage/SolutionsSection'
import TestimonialsSection from '@/components/homepage/TestimonialsSection'
import SecuritySection from '@/components/homepage/SecuritySection'
import NewsSection from '@/components/homepage/NewsSection'
import CtaSection from '@/components/homepage/CtaSection'
import Footer from '@/components/homepage/Footer'
import { getHomepageCustomization } from '@/lib/utils/homepageCustomization'

export default function HomePage() {
  // Homepage renders immediately with default content
  // Customization data loads in background and updates if available
  const [customization, setCustomization] = useState<Record<string, Record<string, any>>>({})

  useEffect(() => {
    // Load customization in background - completely optional
    // Components have built-in defaults so page works without customization data
    // Use setTimeout to ensure it doesn't block initial render
    setTimeout(() => {
      getHomepageCustomization()
        .then((data) => {
          if (data && Object.keys(data).length > 0) {
            setCustomization(data)
          }
        })
        .catch(() => {
          // Silently fail - components have defaults
        })
    }, 100)
  }, [])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      <main>
        <HeroSection data={customization.hero_slider || {}} />
        <StatsSection />
        <ServicesSection data={customization.quick_services || {}} />
        <FeaturesSection data={customization.features || {}} />
        <AboutSection data={customization.about || {}} />
        <SolutionsSection />
        <TestimonialsSection data={customization.testimonials || {}} />
        <SecuritySection />
        <NewsSection data={customization.blog || {}} />
        <CtaSection data={customization.app_download || {}} />
      </main>
      <Footer data={customization.footer || {}} />
    </div>
  )
}
