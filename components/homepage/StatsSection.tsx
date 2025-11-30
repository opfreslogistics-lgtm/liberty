'use client'

import { useEffect, useState, useRef } from 'react'
import { Users, Globe, TrendingUp, Shield, Award, Building2 } from 'lucide-react'

export default function StatsSection() {
  const [counters, setCounters] = useState({
    customers: 0,
    countries: 0,
    assets: 0,
    years: 0,
  })

  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!isVisible) return

    const targets = {
      customers: 12500000,
      countries: 150,
      assets: 850,
      years: 75,
    }

    const duration = 2000
    const steps = 60
    const stepTime = duration / steps

    const animateCounter = (key: keyof typeof targets) => {
      let current = 0
      const increment = targets[key] / steps
      const timer = setInterval(() => {
        current += increment
        if (current >= targets[key]) {
          current = targets[key]
          clearInterval(timer)
        }
        setCounters((prev) => ({ ...prev, [key]: Math.floor(current) }))
      }, stepTime)
    }

    Object.keys(targets).forEach((key) => {
      animateCounter(key as keyof typeof targets)
    })
  }, [isVisible])

  const stats = [
    {
      icon: Users,
      value: `${(counters.customers / 1000000).toFixed(1)}M+`,
      label: 'Active Customers',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Globe,
      value: `${counters.countries}+`,
      label: 'Countries Served',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: TrendingUp,
      value: `$${counters.assets}B+`,
      label: 'Assets Under Management',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      icon: Shield,
      value: '100%',
      label: 'Secure Banking',
      color: 'from-red-500 to-red-600',
    },
    {
      icon: Award,
      value: '#1',
      label: 'Customer Satisfaction',
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      icon: Building2,
      value: `${counters.years}+`,
      label: 'Years of Excellence',
      color: 'from-purple-500 to-purple-600',
    },
  ]

  return (
    <section ref={sectionRef} className="py-20 bg-gradient-to-br from-gray-50 via-white to-green-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by Millions Worldwide
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Our commitment to excellence has made us a global leader in banking and financial services
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <div
                key={index}
                className="group p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center"
              >
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <div className={`text-3xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.value}
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  {stat.label}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}


