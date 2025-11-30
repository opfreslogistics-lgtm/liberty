'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'

interface TestimonialsSectionProps {
  data: Record<string, any>
}

export default function TestimonialsSection({ data }: TestimonialsSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const testimonials = [
    {
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      name: 'Michael Chen',
      role: 'Entrepreneur & Business Owner',
      company: 'Tech Solutions Inc.',
      content: 'Liberty Bank has transformed how I manage my business finances. The international wire transfers are lightning-fast, and their business banking platform is incredibly intuitive. I can\'t imagine banking anywhere else.',
      rating: 5,
      location: 'San Francisco, CA',
    },
    {
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      name: 'Sarah Williams',
      role: 'Investment Advisor',
      company: 'Wealth Management Group',
      content: 'As a financial professional, I trust Liberty Bank with my personal and client assets. Their security measures are top-notch, and the investment services are exceptional. The mobile app is also beautifully designed.',
      rating: 5,
      location: 'New York, NY',
    },
    {
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      name: 'David Rodriguez',
      role: 'Real Estate Developer',
      company: 'Premium Properties LLC',
      content: 'The business banking services at Liberty Bank are unparalleled. From cash management to international payments, everything works seamlessly. Their customer support team is always available and incredibly knowledgeable.',
      rating: 5,
      location: 'Miami, FL',
    },
    {
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      name: 'Emily Thompson',
      role: 'Marketing Director',
      company: 'Global Marketing Agency',
      content: 'I\'ve been with Liberty Bank for over 5 years, and they keep getting better. The recent app updates make banking so convenient. I especially love the real-time transaction alerts and the ability to deposit checks from anywhere.',
      rating: 5,
      location: 'Chicago, IL',
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  return (
    <section className="py-24 bg-gradient-to-br from-gray-50 via-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-green-200 dark:bg-green-900/20 rounded-full blur-3xl opacity-20"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-200 dark:bg-blue-900/20 rounded-full blur-3xl opacity-20"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by Customers Worldwide
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            See what our customers have to say about their banking experience with Liberty National Bank
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${
                index === currentIndex
                  ? 'opacity-100 transform translate-x-0'
                  : 'opacity-0 absolute inset-0 transform translate-x-full'
              }`}
            >
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 md:p-12">
                <div className="flex items-start space-x-6 mb-6">
                  {/* Avatar */}
                  <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-4 border-green-500">
                    <Image
                      src={testimonial.image}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>

                  {/* Name & Info */}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                        {testimonial.name}
                      </h3>
                      <div className="flex space-x-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-semibold">
                      {testimonial.role}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-500">
                      {testimonial.company} • {testimonial.location}
                    </p>
                  </div>
                </div>

                <Quote className="w-12 h-12 text-green-600 dark:text-green-400 opacity-30 mb-4" />
                <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed italic">
                  "{testimonial.content}"
                </p>
              </div>
            </div>
          ))}

          {/* Navigation */}
          <button
            onClick={prevTestimonial}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-12 p-4 bg-white dark:bg-gray-800 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110"
          >
            <ChevronLeft className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
          <button
            onClick={nextTestimonial}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-12 p-4 bg-white dark:bg-gray-800 rounded-full shadow-xl hover:shadow-2xl transition-all hover:scale-110"
          >
            <ChevronRight className="w-6 h-6 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex justify-center space-x-3 mt-10">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'bg-green-600 w-12 h-3'
                  : 'bg-gray-300 dark:bg-gray-600 w-3 h-3 hover:bg-gray-400 dark:hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}


