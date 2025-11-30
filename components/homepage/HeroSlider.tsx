'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface HeroSliderProps {
  data: Record<string, any>
}

export default function HeroSlider({ data }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const slides: any[] = []

  // Extract slides from data (slide_1, slide_2, etc.)
  for (let i = 1; i <= 5; i++) {
    if (data[i]?.image) {
      slides.push({
        image: data[i].image || `/images/placeholders/home_hero_slider_${i}.jpg`,
        heading: data[i].heading || `Slide ${i} Heading`,
        subheading: data[i].subheading || `Slide ${i} Subheading`,
        buttonText: data[i].button_text || 'Get Started',
      })
    }
  }

  // Default slides if none configured
  if (slides.length === 0) {
    slides.push({
      image: '/images/placeholders/home_hero_slider_1.jpg',
      heading: 'Welcome to Liberty National Bank',
      subheading: 'Your Trusted Banking Partner for Global Financial Solutions',
      buttonText: 'Open Account',
    })
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === currentSlide ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-10" />
          <Image
            src={slide.image}
            alt={slide.heading}
            fill
            className="object-cover"
            priority={index === 0}
            unoptimized
          />
          
          {index === currentSlide && (
            <div className="absolute inset-0 z-20 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="max-w-2xl animate-in fade-in slide-in-from-left duration-1000">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                    {slide.heading}
                  </h1>
                  <p className="text-xl sm:text-2xl text-gray-200 mb-8 leading-relaxed">
                    {slide.subheading}
                  </p>
                  <Link
                    href="/signup"
                    className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
                  >
                    <span>{slide.buttonText}</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}

