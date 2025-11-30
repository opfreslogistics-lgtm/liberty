'use client'

import Image from 'next/image'
import Link from 'next/link'

interface AppDownloadProps {
  data: Record<string, any>
}

export default function AppDownload({ data }: AppDownloadProps) {
  const mockupImage = data.app_mockup_image || '/images/placeholders/mobile_app_mockup.png'
  const googlePlayBadge = data.google_play_badge || '/images/placeholders/google_play_badge.png'
  const appleStoreBadge = data.apple_store_badge || '/images/placeholders/apple_store_badge.png'
  const title = data.app_title || 'Bank on the Go'
  const description = data.app_description || 'Manage your finances from anywhere with our mobile app'

  return (
    <section className="py-20 bg-gradient-to-br from-green-600 to-emerald-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Mockup Image */}
          <div className="relative h-96 md:h-[500px] flex items-center justify-center">
            <Image
              src={mockupImage}
              alt="Mobile App Mockup"
              fill
              className="object-contain"
              unoptimized
            />
          </div>

          {/* Content */}
          <div className="text-white space-y-6">
            <h2 className="text-4xl sm:text-5xl font-bold">
              {title}
            </h2>
            <p className="text-xl text-white/90 leading-relaxed">
              {description}
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="#" className="hover:opacity-80 transition-opacity">
                <Image
                  src={googlePlayBadge}
                  alt="Get it on Google Play"
                  width={180}
                  height={60}
                  className="object-contain"
                  unoptimized
                />
              </Link>
              <Link href="#" className="hover:opacity-80 transition-opacity">
                <Image
                  src={appleStoreBadge}
                  alt="Download on the App Store"
                  width={180}
                  height={60}
                  className="object-contain"
                  unoptimized
                />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


