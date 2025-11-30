'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Wallet, Globe, TrendingUp, Building2, Shield, Smartphone } from 'lucide-react'

interface ServicesSectionProps {
  data: Record<string, any>
}

export default function ServicesSection({ data }: ServicesSectionProps) {
  const services = [
    {
      icon: Wallet,
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop',
      title: 'Personal Banking',
      description: 'Comprehensive checking, savings, and money market accounts designed for your financial goals.',
      features: ['Free Checking', 'High-Yield Savings', 'Mobile Banking', '24/7 Support'],
      color: 'from-blue-500 to-blue-600',
      href: '/accounts',
    },
    {
      icon: Globe,
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop',
      title: 'International Transfers',
      description: 'Send money worldwide with competitive rates and lightning-fast processing times.',
      features: ['Global Coverage', 'Low Fees', 'Same-Day Delivery', 'Real-Time Tracking'],
      color: 'from-emerald-500 to-emerald-600',
      href: '/transfer/wire',
    },
    {
      icon: TrendingUp,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      title: 'Investments & Wealth',
      description: 'Grow your wealth with expert financial advice and diverse investment options.',
      features: ['Portfolio Management', 'Retirement Planning', 'Tax Optimization', 'Expert Advisors'],
      color: 'from-purple-500 to-purple-600',
      href: '/investments',
    },
    {
      icon: Building2,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
      title: 'Business Banking',
      description: 'Complete banking solutions for businesses of all sizes with specialized services.',
      features: ['Business Accounts', 'Merchant Services', 'Payroll Solutions', 'Cash Management'],
      color: 'from-orange-500 to-orange-600',
      href: '/business',
    },
    {
      icon: Shield,
      image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=800&h=600&fit=crop',
      title: 'Loans & Credit',
      description: 'Flexible lending options with competitive rates for personal and business needs.',
      features: ['Personal Loans', 'Mortgages', 'Auto Loans', 'Business Credit'],
      color: 'from-red-500 to-red-600',
      href: '/loans',
    },
  ]

  return (
    <section className="py-24 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-green-100 dark:bg-green-900/20 rounded-full blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-100 dark:bg-blue-900/20 rounded-full blur-3xl opacity-30 translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Comprehensive Banking Solutions
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Everything you need for personal and business banking, all in one place
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <Link
                key={index}
                href={service.href}
                className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Image */}
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    unoptimized
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${service.color} opacity-90`}></div>
                  <div className="absolute top-4 left-4">
                    <div className={`w-14 h-14 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2 mb-6">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div className="flex items-center text-green-600 dark:text-green-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                    <span>Learn More</span>
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}


