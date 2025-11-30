'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { 
  TrendingUp, 
  PieChart, 
  BarChart3, 
  Target,
  Shield,
  CheckCircle2,
  ArrowRight,
  Wallet,
  Globe,
  Clock,
  DollarSign,
  LineChart,
  Briefcase,
  Activity
} from 'lucide-react'

export default function InvestmentsPage() {
  const investmentOptions = [
    {
      id: 'portfolio-management',
      name: 'Portfolio Management',
      description: 'Professional portfolio management services tailored to your investment goals and risk tolerance.',
      icon: PieChart,
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      features: [
        'Personalized investment strategies',
        'Diversified portfolio allocation',
        'Regular portfolio rebalancing',
        'Risk assessment and management',
        'Professional investment advisors',
        'Performance tracking and reporting'
      ],
      color: 'from-blue-500 to-blue-600',
      href: '/contact',
      popular: true
    },
    {
      id: 'retirement-planning',
      name: 'Retirement Planning',
      description: 'Secure your financial future with comprehensive retirement planning and investment solutions.',
      icon: Target,
      image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&h=600&fit=crop',
      features: [
        '401(k) and IRA options',
        'Retirement income planning',
        'Tax-advantaged accounts',
        'Long-term growth strategies',
        'Retirement goal tracking',
        'Expert financial guidance'
      ],
      color: 'from-green-500 to-emerald-600',
      href: '/contact',
      popular: false
    },
    {
      id: 'mutual-funds',
      name: 'Mutual Funds',
      description: 'Access professionally managed investment funds with diversified holdings across various asset classes.',
      icon: BarChart3,
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop',
      features: [
        'Diversified investment options',
        'Professional fund management',
        'Low minimum investments',
        'Automatic reinvestment',
        'Regular income distributions',
        'Wide range of fund types'
      ],
      color: 'from-purple-500 to-purple-600',
      href: '/contact',
      popular: false
    },
    {
      id: 'stocks-bonds',
      name: 'Stocks & Bonds',
      description: 'Build wealth with individual stocks, bonds, and other securities through our trading platform.',
      icon: LineChart,
      image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=600&fit=crop',
      features: [
        'Commission-free stock trading',
        'Research and market insights',
        'Bond trading platform',
        'Real-time market data',
        'Options and derivatives',
        'Expert trading support'
      ],
      color: 'from-orange-500 to-orange-600',
      href: '/contact',
      popular: false
    },
    {
      id: 'wealth-management',
      name: 'Wealth Management',
      description: 'Comprehensive wealth management services for high-net-worth individuals and families.',
      icon: Briefcase,
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
      features: [
        'Customized wealth strategies',
        'Estate planning services',
        'Tax optimization strategies',
        'Private banking services',
        'Dedicated relationship manager',
        'Multi-generational planning'
      ],
      color: 'from-indigo-500 to-indigo-600',
      href: '/contact',
      popular: false
    },
    {
      id: 'robo-advisor',
      name: 'Robo-Advisor',
      description: 'Automated investment management with low fees and personalized portfolio recommendations.',
      icon: Activity,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      features: [
        'Automated portfolio management',
        'Low management fees',
        'Goal-based investing',
        'Tax-loss harvesting',
        'Automatic rebalancing',
        '24/7 account access'
      ],
      color: 'from-pink-500 to-pink-600',
      href: '/contact',
      popular: false
    }
  ]

  const benefits = [
    {
      icon: Shield,
      title: 'Protected Investments',
      description: 'SIPC insured up to $500,000 with additional protection through excess SIPC coverage'
    },
    {
      icon: TrendingUp,
      title: 'Proven Track Record',
      description: 'Years of successful investment management with strong returns for our clients'
    },
    {
      icon: Globe,
      title: 'Global Opportunities',
      description: 'Access to international markets and global investment opportunities'
    },
    {
      icon: Clock,
      title: 'Expert Guidance',
      description: 'Dedicated investment advisors to help you make informed decisions'
    }
  ]

  const features = [
    {
      icon: DollarSign,
      title: 'Competitive Returns',
      description: 'Access investment opportunities with competitive returns designed to grow your wealth over time.'
    },
    {
      icon: PieChart,
      title: 'Diversification',
      description: 'Build diversified portfolios across asset classes to manage risk and maximize returns.'
    },
    {
      icon: Target,
      title: 'Goal-Based Investing',
      description: 'Create investment strategies aligned with your specific financial goals and timelines.'
    },
    {
      icon: Activity,
      title: 'Active Management',
      description: 'Professional portfolio management with regular monitoring and strategic adjustments.'
    }
  ]

  const stats = [
    { value: '$50B+', label: 'Assets Under Management' },
    { value: '250K+', label: 'Active Investors' },
    { value: '15%', label: 'Average Annual Returns' },
    { value: '25+', label: 'Years of Experience' }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-semibold mb-6">
                  <TrendingUp className="w-4 h-4" />
                  <span>Investment Solutions</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  Grow Your{' '}
                  <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    Wealth
                  </span>
                  {' '}with Confidence
                </h1>
                
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  Professional investment services designed to help you achieve your financial goals. 
                  From retirement planning to wealth management, we provide expert guidance every step of the way.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-600 to-blue-600 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                  >
                    <span>Start Investing</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white dark:bg-gray-800 border-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 rounded-xl font-semibold text-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200"
                  >
                    <span>Schedule Consultation</span>
                  </Link>
                </div>
              </div>

              <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop"
                  alt="Investment Solutions"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-900/60 via-emerald-800/30 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-gradient-to-r from-emerald-600 to-blue-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    {stat.value}
                  </div>
                  <div className="text-sm sm:text-base text-white/90">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Investment Options Grid */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Investment Solutions for Every Goal
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Choose from a wide range of investment options tailored to your needs
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {investmentOptions.map((option, index) => {
                const Icon = option.icon
                return (
                  <div
                    key={option.id}
                    className="group relative bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                  >
                    {option.popular && (
                      <div className="absolute top-6 right-6 z-10">
                        <span className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                          POPULAR
                        </span>
                      </div>
                    )}
                    
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={option.image}
                        alt={option.name}
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
                        {option.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed">
                        {option.description}
                      </p>

                      <div className="space-y-2 mb-6">
                        {option.features.slice(0, 4).map((feature, idx) => (
                          <div key={idx} className="flex items-start space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                            <span className="text-xs text-gray-700 dark:text-gray-300">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Link
                        href={option.href}
                        className={`inline-flex items-center space-x-2 w-full justify-center px-4 py-3 bg-gradient-to-r ${option.color} text-white rounded-lg font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm`}
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
        <section className="py-20 bg-gradient-to-br from-gray-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Why Invest With Us?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Experience the difference of professional investment management
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
                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
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
                Trusted Investment Platform
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Security and expertise you can rely on
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
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
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
        <section className="py-20 bg-gradient-to-r from-emerald-600 to-blue-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Start Your Investment Journey Today
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Take the first step towards building long-term wealth. Our expert advisors are ready to help you 
              create an investment strategy that aligns with your financial goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white text-emerald-600 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-200"
              >
                <span>Speak with an Advisor</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer data={{}} />
    </div>
  )
}

