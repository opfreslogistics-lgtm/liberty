'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { 
  Wallet, 
  TrendingUp, 
  Building2, 
  Lock,
  Shield,
  CheckCircle2,
  ArrowRight,
  CreditCard,
  Globe,
  Clock,
  Sparkles,
  Percent
} from 'lucide-react'

export default function AccountsPage() {
  const accountTypes = [
    {
      id: 'checking',
      name: 'Checking Account',
      description: 'Your everyday banking solution for seamless transactions and easy access to your funds.',
      icon: CreditCard,
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop',
      features: [
        'No monthly maintenance fees',
        'Unlimited transactions',
        'Free debit card included',
        'Mobile banking access',
        'Bill pay services',
        'Overdraft protection available'
      ],
      color: 'from-blue-500 to-blue-600',
      href: '/signup',
      popular: true
    },
    {
      id: 'savings',
      name: 'Savings Account',
      description: 'Grow your money with competitive interest rates while keeping your funds accessible.',
      icon: TrendingUp,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      features: [
        'Competitive interest rates',
        'No minimum balance required',
        'Interest compounded monthly',
        'FDIC insured up to $250,000',
        'Easy transfers to checking',
        'Automatic savings plans'
      ],
      color: 'from-green-500 to-emerald-600',
      href: '/signup',
      popular: false
    },
    {
      id: 'business',
      name: 'Business Account',
      description: 'Comprehensive banking solutions designed for businesses of all sizes.',
      icon: Building2,
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
      features: [
        'Business checking and savings',
        'Merchant services',
        'Payroll processing',
        'Business credit cards',
        'Line of credit options',
        'Dedicated business support'
      ],
      color: 'from-purple-500 to-purple-600',
      href: '/signup',
      popular: false
    },
  ]

  const benefits = [
    {
      icon: Shield,
      title: 'FDIC Insured',
      description: 'Your deposits are protected up to $250,000 per account type'
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Bank from anywhere with our mobile app and online banking'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock customer service when you need it most'
    },
    {
      icon: Sparkles,
      title: 'No Hidden Fees',
      description: 'Transparent pricing with no surprise charges or fees'
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold mb-6">
                <Wallet className="w-4 h-4" />
                <span>Account Solutions</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Choose the Perfect{' '}
                <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                  Account for You
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Whether you're managing daily expenses, saving for the future, or running a business, 
                we have the perfect account solution to meet your financial needs.
              </p>
            </div>
          </div>
        </section>

        {/* Account Types Grid */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-10">
              {accountTypes.map((account, index) => {
                const Icon = account.icon
                return (
                  <div
                    key={account.id}
                    className="group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                  >
                    {account.popular && (
                      <div className="absolute top-6 right-6 z-10">
                        <span className="px-4 py-1.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white text-xs font-bold rounded-full shadow-lg">
                          MOST POPULAR
                        </span>
                      </div>
                    )}
                    
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={account.image}
                        alt={account.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        unoptimized
                      />
                      <div className={`absolute inset-0 bg-gradient-to-t from-${account.color.split('-')[1]}-900/90 via-${account.color.split('-')[1]}-800/50 to-transparent`}></div>
                      <div className="absolute top-6 left-6">
                        <div className={`w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30`}>
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {account.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                        {account.description}
                      </p>

                      <div className="space-y-3 mb-8">
                        {account.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start space-x-3">
                            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Link
                        href={account.href}
                        className={`inline-flex items-center space-x-2 w-full justify-center px-6 py-4 bg-gradient-to-r ${account.color} text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200`}
                      >
                        <span>Open {account.name}</span>
                        <ArrowRight className="w-5 h-5" />
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Choose Our Accounts?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Experience banking that's designed with your needs in mind
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-green-600 to-emerald-700 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Open an account today in just minutes and start enjoying the benefits of banking with Liberty National Bank.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white text-green-600 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                <span>Open an Account</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-200"
              >
                <span>Learn More</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer data={{}} />
    </div>
  )
}


