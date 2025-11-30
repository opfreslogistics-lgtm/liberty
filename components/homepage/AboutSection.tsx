'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Shield, Globe, Users, Building2 } from 'lucide-react'

interface AboutSectionProps {
  data: Record<string, any>
}

export default function AboutSection({ data }: AboutSectionProps) {
  // Professional banking image from Unsplash
  const defaultImage = 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=800&fit=crop&q=80'
  
  // Check if customization has a valid image URL (not empty, not placeholder)
  const customImage = data?.about_image || data?.about_image_main || ''
  const isValidCustomImage = customImage && 
                             typeof customImage === 'string' && 
                             customImage.trim().length > 10 && // Must be substantial length
                             customImage.startsWith('http') && // Must be full URL
                             !customImage.includes('placeholder') &&
                             !customImage.includes('/images/placeholders/') &&
                             !customImage.startsWith('/images/') && // Ignore relative paths
                             !customImage.includes('example.com') &&
                             customImage.includes('.') // Must have file extension
  
  // Always use default Supabase image - customization can override if it's a valid full URL
  const aboutImage = isValidCustomImage ? customImage : defaultImage
  
  // Debug: Log the image being used (remove in production)
  if (typeof window !== 'undefined') {
    console.log('About Section Image:', { aboutImage, customImage, isValidCustomImage, data })
  }
  
  const title = data?.about_title || 'Banking Excellence Since 1949'
  const content = data?.about_content || 'Liberty National Bank has been a trusted financial partner for over 75 years, serving millions of customers across 150+ countries. We combine traditional banking values with cutting-edge technology to deliver exceptional service and innovative financial solutions.'
  const buttonText = data?.about_button_text || 'Learn More About Us'

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <div className="relative h-96 md:h-[600px] rounded-3xl overflow-hidden shadow-2xl group">
            <Image
              src={aboutImage}
              alt="About Liberty Bank"
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
              unoptimized
              priority
              key={aboutImage} // Force re-render when image changes
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 text-white">
              <div className="flex items-center space-x-2 mb-2">
                <Building2 className="w-6 h-6" />
                <span className="font-semibold">75+ Years of Excellence</span>
              </div>
              <p className="text-sm text-white/90">Trusted by millions worldwide since 1949</p>
            </div>
          </div>

          {/* Content Side */}
          <div className="space-y-6">
            <div className="inline-block px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold mb-4">
              About Us
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              {content}
            </p>

            <div className="grid grid-cols-3 gap-6 py-6">
              <div className="text-center">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Shield className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">100%</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Secure</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Globe className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">150+</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Countries</p>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Users className="w-7 h-7 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">10M+</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Customers</p>
              </div>
            </div>

            <Link
              href="/about"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <span>{buttonText}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

