'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

interface PromoBannerProps {
  data: Record<string, any>
}

export default function PromoBanner({ data }: PromoBannerProps) {
  const promoImage = data.promo_image || '/images/placeholders/promo_banner_bg.jpg'
  const title = data.promo_title || 'Apply for a Credit Card Today'
  const description = data.promo_description || 'Get up to 5% cashback on all purchases'
  const buttonText = data.promo_button_text || 'Apply Now'

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={promoImage}
          alt="Promotional Banner"
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/90 via-green-800/80 to-green-900/90" />
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            {title}
          </h2>
          <p className="text-xl text-gray-100 mb-8 leading-relaxed">
            {description}
          </p>
          <Link
            href="/accounts"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-green-700 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
          >
            <span>{buttonText}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}


