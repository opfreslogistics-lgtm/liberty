'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Smartphone, Download, CheckCircle } from 'lucide-react'

interface CtaSectionProps {
  data: Record<string, any>
}

export default function CtaSection({ data }: CtaSectionProps) {
  return (
    <section className="py-24 bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-white">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full mb-6">
              <Smartphone className="w-5 h-5" />
              <span className="font-semibold">Mobile Banking</span>
            </div>

            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              Bank on the Go with Our Mobile App
            </h2>

            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Manage your finances anytime, anywhere with our award-winning mobile banking app. 
              Transfer money, pay bills, deposit checks, and more - all from your smartphone.
            </p>

            {/* Features */}
            <ul className="space-y-4 mb-8">
              {[
                'Deposit checks with mobile capture',
                'Real-time account alerts and notifications',
                'Biometric login for quick access',
                'Send and receive money instantly',
                'Track spending with budgeting tools',
              ].map((feature, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-6 h-6 text-white flex-shrink-0" />
                  <span className="text-lg">{feature}</span>
                </li>
              ))}
            </ul>

            {/* Download Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="#"
                className="inline-flex items-center space-x-3 px-6 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-900 transition-all transform hover:scale-105"
              >
                <Download className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-xs">Download on the</div>
                  <div className="text-lg">App Store</div>
                </div>
              </Link>
              <Link
                href="#"
                className="inline-flex items-center space-x-3 px-6 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-900 transition-all transform hover:scale-105"
              >
                <Download className="w-6 h-6" />
                <div className="text-left">
                  <div className="text-xs">Get it on</div>
                  <div className="text-lg">Google Play</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="relative flex justify-center">
            <div className="relative w-80 h-[600px]">
              <Image
                src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=1200&fit=crop"
                alt="Mobile App"
                fill
                className="object-contain rounded-[3rem] shadow-2xl"
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


