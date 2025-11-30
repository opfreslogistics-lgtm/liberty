'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, CheckCircle, Zap, Lock, Globe, Users, Award } from 'lucide-react'

export default function SolutionsSection() {
  const solutions = [
    {
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=1200&h=800&fit=crop',
      title: 'Personal Financial Management',
      description: 'Take control of your finances with our comprehensive personal banking solutions designed for your lifestyle.',
      features: [
        'Free online and mobile banking',
        'High-yield savings accounts',
        'Zero-fee checking options',
        'Personal financial planning tools',
      ],
    },
    {
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=800&fit=crop',
      title: 'Business Banking Excellence',
      description: 'Streamline your business operations with specialized banking services and dedicated support.',
      features: [
        'Business checking and savings',
        'Merchant payment processing',
        'Payroll and HR solutions',
        'Cash management services',
      ],
    },
    {
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=1200&h=800&fit=crop',
      title: 'Wealth Management',
      description: 'Grow and protect your wealth with personalized investment strategies and expert guidance.',
      features: [
        'Custom investment portfolios',
        'Retirement planning services',
        'Estate planning assistance',
        'Tax optimization strategies',
      ],
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Solutions for Every Financial Need
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Whether you're managing personal finances or running a business, we have the right solution for you
          </p>
        </div>

        <div className="space-y-24">
          {solutions.map((solution, index) => (
            <div
              key={index}
              className={`flex flex-col ${index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}
            >
              {/* Image */}
              <div className="flex-1 relative h-96 w-full rounded-3xl overflow-hidden shadow-2xl group">
                <Image
                  src={solution.image}
                  alt={solution.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  <Award className="w-5 h-5" />
                  <span className="font-semibold">Trusted Solution</span>
                </div>

                <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                  {solution.title}
                </h3>

                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  {solution.description}
                </p>

                <ul className="space-y-3">
                  {solution.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/solutions"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                >
                  <span>Explore Solution</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


