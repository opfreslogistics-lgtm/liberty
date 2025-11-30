'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Wallet, Smartphone, FileText, CreditCard, TrendingUp } from 'lucide-react'

interface QuickServicesProps {
  data: Record<string, any>
}

const defaultIcons = [Wallet, Smartphone, FileText, CreditCard, TrendingUp]

export default function QuickServices({ data }: QuickServicesProps) {
  const services = []

  for (let i = 1; i <= 5; i++) {
    if (data[i]) {
      services.push({
        icon: data[i].icon || `/images/placeholders/quick_service_icon_${i}.png`,
        title: data[i].title || `Service ${i}`,
        description: data[i].description || 'Service description',
        DefaultIcon: defaultIcons[i - 1],
      })
    }
  }

  if (services.length === 0) {
    services.push(
      { icon: null, title: 'Transfer Money', description: 'Send money instantly', DefaultIcon: Wallet },
      { icon: null, title: 'Mobile Deposit', description: 'Deposit checks from anywhere', DefaultIcon: Smartphone },
      { icon: null, title: 'Bill Payments', description: 'Pay bills easily online', DefaultIcon: FileText },
      { icon: null, title: 'Loan Request', description: 'Apply for loans quickly', DefaultIcon: CreditCard },
      { icon: null, title: 'Account Upgrade', description: 'Upgrade your account', DefaultIcon: TrendingUp },
    )
  }

  return (
    <section className="py-20 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Quick Services
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Access your banking services with ease
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {services.map((service, index) => (
            <Link
              key={index}
              href="/services"
              className="group p-6 bg-white dark:bg-gray-900 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                {service.icon ? (
                  <Image
                    src={service.icon}
                    alt={service.title}
                    width={40}
                    height={40}
                    className="object-contain"
                    unoptimized
                  />
                ) : (
                  <service.DefaultIcon className="w-8 h-8 text-green-600 dark:text-green-400" />
                )}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {service.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {service.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}


