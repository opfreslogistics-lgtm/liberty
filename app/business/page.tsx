'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { 
  Building2, 
  CreditCard, 
  TrendingUp, 
  Users,
  Shield,
  CheckCircle2,
  ArrowRight,
  Wallet,
  Globe,
  Clock,
  BarChart3,
  FileText,
  Briefcase,
  PieChart,
  Phone
} from 'lucide-react'

export default function BusinessPage() {
  const businessServices = [
    {
      id: 'business-checking',
      name: 'Business Checking',
      description: 'Streamline your business finances with our comprehensive checking account designed for daily operations.',
      icon: Wallet,
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
      features: [
        'No monthly maintenance fees',
        'Unlimited transactions',
        'Business debit card included',
        'Online and mobile banking',
        'Payroll services integration',
        'Monthly statements'
      ],
      color: 'from-blue-500 to-blue-600',
      href: '/signup',
      popular: true
    },
    {
      id: 'business-savings',
      name: 'Business Savings',
      description: 'Grow your business reserves with competitive interest rates and flexible account options.',
      icon: TrendingUp,
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop',
      features: [
        'Competitive interest rates',
        'No minimum balance required',
        'Easy fund transfers',
        'Interest compounded monthly',
        'Business reserve management',
        'FDIC insured'
      ],
      color: 'from-green-500 to-emerald-600',
      href: '/signup',
      popular: false
    },
    {
      id: 'merchant-services',
      name: 'Merchant Services',
      description: 'Accept payments from customers anywhere, anytime with our secure payment processing solutions.',
      icon: CreditCard,
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
      features: [
        'Credit and debit card processing',
        'Mobile payment solutions',
        'Point-of-sale systems',
        'Online payment gateway',
        'Next-day funding available',
        '24/7 transaction monitoring'
      ],
      color: 'from-purple-500 to-purple-600',
      href: '/contact',
      popular: false
    },
    {
      id: 'business-loans',
      name: 'Business Loans',
      description: 'Secure funding for your business growth with flexible loan options and competitive rates.',
      icon: Briefcase,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
      features: [
        'Term loans and lines of credit',
        'Fast approval process',
        'Competitive interest rates',
        'Flexible repayment options',
        'Equipment financing',
        'Working capital loans'
      ],
      color: 'from-orange-500 to-orange-600',
      href: '/loans',
      popular: false
    },
    {
      id: 'payroll-services',
      name: 'Payroll Services',
      description: 'Simplify payroll management with automated processing and compliance solutions.',
      icon: Users,
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=600&fit=crop',
      features: [
        'Automated payroll processing',
        'Tax filing and compliance',
        'Direct deposit capabilities',
        'Employee self-service portal',
        'Time tracking integration',
        'Payroll reporting'
      ],
      color: 'from-red-500 to-red-600',
      href: '/contact',
      popular: false
    },
    {
      id: 'cash-management',
      name: 'Cash Management',
      description: 'Optimize your cash flow with advanced treasury management tools and services.',
      icon: BarChart3,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      features: [
        'Real-time account monitoring',
        'Automated sweeps and transfers',
        'Multi-bank consolidation',
        'Account reconciliation',
        'Cash flow forecasting',
        'Custom reporting'
      ],
      color: 'from-indigo-500 to-indigo-600',
      href: '/contact',
      popular: false
    }
  ]

  const benefits = [
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Bank-level encryption and fraud protection to keep your business safe'
    },
    {
      icon: Clock,
      title: 'Dedicated Support',
      description: 'Priority business banking support with dedicated relationship managers'
    },
    {
      icon: Globe,
      title: 'Global Solutions',
      description: 'International payment and trade finance services for global business'
    },
    {
      icon: TrendingUp,
      title: 'Growth Tools',
      description: 'Financial tools and insights to help your business scale and succeed'
    }
  ]

  const features = [
    {
      icon: Phone,
      title: '24/7 Business Banking',
      description: 'Access your accounts and manage transactions anytime, anywhere with our mobile and online banking platforms.'
    },
    {
      icon: FileText,
      title: 'Simplified Accounting',
      description: 'Export statements, track expenses, and integrate with popular accounting software for seamless bookkeeping.'
    },
    {
      icon: PieChart,
      title: 'Business Analytics',
      description: 'Get detailed insights into your cash flow, spending patterns, and financial health with comprehensive reporting.'
    },
    {
      icon: CheckCircle2,
      title: 'Compliance Made Easy',
      description: 'Stay compliant with automated tax reporting, payroll deductions, and regulatory filing support.'
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-semibold mb-6">
                  <Building2 className="w-4 h-4" />
                  <span>Business Banking Solutions</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  Power Your Business{' '}
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Growth
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Comprehensive banking solutions designed to help businesses of all sizes thrive. 
                  From startups to enterprises, we provide the tools and services you need to manage your finances effectively.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                  >
                    <span>Open Business Account</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white dark:bg-gray-800 border-2 border-purple-600 text-purple-600 dark:text-purple-400 rounded-xl font-semibold text-lg hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                  >
                    <span>Contact Sales</span>
                  </Link>
                </div>
              </div>

              <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop"
                  alt="Business Banking"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/60 via-purple-800/30 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Business Services Grid */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Complete Business Banking Suite
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Everything you need to manage your business finances efficiently
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {businessServices.map((service, index) => {
                const Icon = service.icon
                return (
                  <div
                    key={service.id}
                    className="group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                  >
                    {service.popular && (
                      <div className="absolute top-6 right-6 z-10">
                        <span className="px-4 py-1.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                          POPULAR
                        </span>
                      </div>
                    )}
                    
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        unoptimized
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-800/50 to-transparent`}></div>
                      <div className="absolute top-6 left-6">
                        <div className={`w-12 h-12 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/30`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {service.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
                        {service.description}
                      </p>

                      <div className="space-y-2 mb-6">
                        {service.features.slice(0, 4).map((feature, idx) => (
                          <div key={idx} className="flex items-start space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-700 dark:text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Link
                        href={service.href}
                        className={`inline-flex items-center space-x-2 w-full justify-center px-4 py-3 bg-gradient-to-r ${service.color} text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm`}
                      >
                        <span>Learn More</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Built for Modern Business
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Tools and features that grow with your business
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Businesses Choose Us
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Trusted by thousands of businesses worldwide
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div
                    key={index}
                    className="text-center p-6"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {benefit.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Elevate Your Business?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join thousands of successful businesses that trust Liberty National Bank for their financial needs. 
              Get started today and experience the difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                <span>Open Business Account</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-200"
              >
                <span>Schedule a Consultation</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer data={{}} />
    </div>
  )
}


