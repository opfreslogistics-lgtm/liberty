'use client'

import Image from 'next/image'

interface PartnersSectionProps {
  data: Record<string, any>
}

export default function PartnersSection({ data }: PartnersSectionProps) {
  const partners = []

  for (let i = 1; i <= 4; i++) {
    if (data[`partner_${i}_logo`]) {
      partners.push({
        logo: data[`partner_${i}_logo`] || `/images/placeholders/partner_logo_${i}.png`,
      })
    }
  }

  if (partners.length === 0) {
    partners.push(
      { logo: '/images/placeholders/partner_logo_1.png' },
      { logo: '/images/placeholders/partner_logo_2.png' },
      { logo: '/images/placeholders/partner_logo_3.png' },
      { logo: '/images/placeholders/partner_logo_4.png' },
    )
  }

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted Partners & Certifications
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center">
          {partners.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-6 bg-white dark:bg-gray-900 rounded-xl hover:shadow-lg transition-all duration-300 grayscale hover:grayscale-0"
            >
              <Image
                src={partner.logo}
                alt={`Partner ${index + 1}`}
                width={150}
                height={80}
                className="object-contain max-h-16"
                unoptimized
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


