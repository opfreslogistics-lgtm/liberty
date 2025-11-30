'use client'

import Image from 'next/image'
import { FileText, Shield, CheckCircle } from 'lucide-react'

interface AccountStepsProps {
  data: Record<string, any>
}

const defaultIcons = [FileText, Shield, CheckCircle]

export default function AccountSteps({ data }: AccountStepsProps) {
  const steps = []

  for (let i = 1; i <= 3; i++) {
    if (data[i]) {
      steps.push({
        icon: data[i].icon || `/images/placeholders/step_icon_${i}.png`,
        title: data[i].title || `Step ${i}`,
        description: data[i].description || 'Step description',
        DefaultIcon: defaultIcons[i - 1],
      })
    }
  }

  if (steps.length === 0) {
    steps.push(
      { icon: null, title: 'Fill Registration', description: 'Complete your registration form', DefaultIcon: FileText },
      { icon: null, title: 'Verify Identity', description: 'Verify your identity documents', DefaultIcon: Shield },
      { icon: null, title: 'Start Banking', description: 'Start using your account', DefaultIcon: CheckCircle },
    )
  }

  return (
    <section className="py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Open Your Account in 3 Simple Steps
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Get started in minutes
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl text-center hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl flex items-center justify-center relative">
                  {step.icon ? (
                    <Image
                      src={step.icon}
                      alt={step.title}
                      width={48}
                      height={48}
                      className="object-contain"
                      unoptimized
                    />
                  ) : (
                    <step.DefaultIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
                  )}
                  <div className="absolute -top-3 -right-3 w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 w-8 h-0.5 bg-green-600 transform -translate-y-1/2">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-green-600 rounded-full"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}


