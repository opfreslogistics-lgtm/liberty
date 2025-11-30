'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { 
  Building2, 
  Shield, 
  Globe, 
  Users,
  TrendingUp,
  Award,
  CheckCircle2,
  ArrowRight,
  Clock,
  Target,
  Heart,
  BarChart3
} from 'lucide-react'

export default function AboutPage() {
  const values = [
    {
      icon: Shield,
      title: 'Security First',
      description: 'Your financial security is our top priority. We employ bank-level encryption and advanced fraud detection to protect your assets.'
    },
    {
      icon: Users,
      title: 'Trust & Integrity',
      description: 'We build lasting relationships with our customers through transparency, honesty, and unwavering commitment to ethical banking.'
    },
    {
      icon: Users,
      title: 'Customer Centric',
      description: 'Every decision we make is with our customers in mind. Your success is our success, and we\'re here to help you achieve your financial goals.'
    },
    {
      icon: TrendingUp,
      title: 'Innovation',
      description: 'We continuously invest in cutting-edge technology to provide you with the most convenient and efficient banking experience possible.'
    }
  ]

  const milestones = [
    {
      year: '1949',
      title: 'Foundation',
      description: 'Liberty National Bank was founded with a vision to provide accessible banking to everyone.'
    },
    {
      year: '1975',
      title: 'Global Expansion',
      description: 'Opened our first international branch, marking the beginning of our global presence.'
    },
    {
      year: '2000',
      title: 'Digital Revolution',
      description: 'Launched our online banking platform, revolutionizing how customers manage their finances.'
    },
    {
      year: '2015',
      title: 'Mobile Banking',
      description: 'Introduced our mobile banking app, bringing banking services to customers\' fingertips.'
    },
    {
      year: '2020',
      title: 'AI Integration',
      description: 'Integrated artificial intelligence to provide personalized financial insights and recommendations.'
    },
    {
      year: '2024',
      title: 'Modern Banking',
      description: 'Continuing to lead the industry with innovative solutions and exceptional customer service.'
    }
  ]

  const stats = [
    { value: '75+', label: 'Years of Excellence', icon: Clock },
    { value: '10M+', label: 'Active Customers', icon: Users },
    { value: '150+', label: 'Countries Served', icon: Globe },
    { value: '$2.5T', label: 'Assets Under Management', icon: BarChart3 }
  ]

  const leadership = [
    {
      name: 'John Mitchell',
      role: 'Chief Executive Officer',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      bio: '30+ years of banking experience, leading Liberty Bank to global success.'
    },
    {
      name: 'Sarah Johnson',
      role: 'Chief Financial Officer',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      bio: 'Expert in financial strategy and risk management with international experience.'
    },
    {
      name: 'Michael Chen',
      role: 'Chief Technology Officer',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      bio: 'Technology innovator driving digital transformation in banking.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'Chief Operating Officer',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      bio: 'Operations excellence specialist ensuring seamless customer experiences.'
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
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold mb-6">
                  <Building2 className="w-4 h-4" />
                  <span>About Liberty Bank</span>
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                  Banking Excellence{' '}
                  <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                    Since 1949
                  </span>
                </h1>
                
                <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                  For over 75 years, Liberty National Bank has been a trusted financial partner, 
                  serving millions of customers across 150+ countries. We combine traditional banking values 
                  with cutting-edge technology to deliver exceptional service.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                  >
                    <span>Join Us Today</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    href="/contact"
                    className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white dark:bg-gray-800 border-2 border-green-600 text-green-600 dark:text-green-400 rounded-xl font-semibold text-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
                  >
                    <span>Contact Us</span>
                  </Link>
                </div>
              </div>

              <div className="relative h-96 lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1200&h=800&fit=crop&q=80"
                  alt="About Liberty Bank - Modern banking excellence"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-green-900/60 via-green-800/30 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-3">
                      <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                    <div className="text-4xl sm:text-5xl font-bold text-white mb-2">
                      {stat.value}
                    </div>
                    <div className="text-sm sm:text-base text-white/90">
                      {stat.label}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Our Story
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                From humble beginnings to global recognition, discover the journey that shaped Liberty National Bank 
                into the trusted financial institution it is today.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {milestones.map((milestone, index) => (
                <div
                  key={index}
                  className="relative bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 border-l-4 border-green-600"
                >
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {milestone.year}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {milestone.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {milestone.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Our Core Values
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group"
                  >
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Leadership Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Our Leadership Team
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Meet the experienced professionals leading Liberty National Bank
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {leadership.map((leader, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700 group"
                >
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={leader.image}
                      alt={leader.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      unoptimized
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                      {leader.name}
                    </h3>
                    <p className="text-green-600 dark:text-green-400 font-semibold text-sm mb-3">
                      {leader.role}
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {leader.bio}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-semibold mb-6">
                  <Target className="w-4 h-4" />
                  <span>Our Mission</span>
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                  Empowering Financial Freedom
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                  At Liberty National Bank, our mission is to empower individuals and businesses worldwide 
                  to achieve their financial goals through innovative banking solutions, exceptional service, and 
                  unwavering commitment to security and trust.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mt-12">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Our Vision
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    To be the world's most trusted and innovative financial institution, 
                    enabling our customers to thrive in an ever-changing global economy.
                  </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-4">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                    Our Promise
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                    We promise to always put our customers first, provide transparent and fair services, 
                    and continuously innovate to meet your evolving financial needs.
                  </p>
                </div>
              </div>
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
              Become Part of Our Story
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Join millions of customers who trust Liberty National Bank for their financial needs. 
              Start your journey with us today.
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
                <span>Get in Touch</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer data={{}} />
    </div>
  )
}

