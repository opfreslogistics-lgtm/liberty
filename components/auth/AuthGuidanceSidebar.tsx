'use client'

import { useState } from 'react'
import {
  CheckCircle2,
  Shield,
  Lock,
  CreditCard,
  Building2,
  Globe,
  Zap,
  Award,
  Info,
  HelpCircle,
  X,
  ChevronRight,
  TrendingUp,
  Smartphone,
  DollarSign,
} from 'lucide-react'
import clsx from 'clsx'
import Image from 'next/image'

interface AuthGuidanceSidebarProps {
  type: 'signup' | 'login'
  currentStep?: number
}

export function AuthGuidanceSidebar({ type, currentStep = 1 }: AuthGuidanceSidebarProps) {
  const [isOpen, setIsOpen] = useState(true)

  const signupGuidance = [
    {
      step: 1,
      title: 'Basic Information',
      items: [
        'Provide your full name and contact details',
        'Choose a unique username',
        'Create a strong password (8+ characters)',
        'Verify your email address',
      ],
    },
    {
      step: 2,
      title: 'Account Details',
      items: [
        'Enter your personal information',
        'Add your address details',
        'Select employment status',
        'Choose account types (Checking, Savings, Business)',
      ],
    },
    {
      step: 3,
      title: 'Verification',
      items: [
        'Upload valid ID documents',
        'Complete financial information',
        'Review and submit your application',
        'Wait for account approval',
      ],
    },
  ]

  const benefits = [
    {
      icon: Shield,
      title: 'Bank-Level Security',
      description: '256-bit encryption and multi-factor authentication',
    },
    {
      icon: Zap,
      title: 'Instant Access',
      description: 'Get your account approved within minutes',
    },
    {
      icon: Globe,
      title: 'Global Banking',
      description: 'Send and receive money worldwide',
    },
    {
      icon: CreditCard,
      title: 'Virtual Cards',
      description: 'Get instant virtual cards for all your accounts',
    },
  ]

  const loginTips = [
    {
      icon: Lock,
      title: 'Secure Login',
      description: 'Your session is protected with bank-level encryption',
    },
    {
      icon: Building2,
      title: 'Multi-Account Access',
      description: 'Manage all your accounts from one dashboard',
    },
    {
      icon: Award,
      title: '24/7 Support',
      description: 'Get help anytime with our support team',
    },
  ]

  const features = [
    { icon: Smartphone, text: 'Mobile Banking App' },
    { icon: DollarSign, text: 'Investment Options' },
    { icon: TrendingUp, text: 'Real-time Analytics' },
    { icon: CreditCard, text: 'Instant Card Generation' },
  ]

  if (type === 'login') {
    return (
      <div className="hidden lg:block w-96 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 p-8 overflow-y-auto sticky top-16 h-[calc(100vh-4rem)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <div className="space-y-8">
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Secure access to your banking dashboard
            </p>
          </div>

          {/* Promotional Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 p-6 text-white shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-2">New Mobile App!</h3>
              <p className="text-sm text-green-50 mb-4">
                Download our app and get $50 bonus when you make your first transaction
              </p>
              <button className="px-4 py-2 bg-white text-green-700 rounded-lg font-semibold text-sm hover:bg-green-50 transition-colors">
                Download Now
              </button>
            </div>
          </div>

          {/* Tips */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-green-700 dark:text-green-400" />
              Quick Tips
            </h3>
            {loginTips.map((tip, index) => {
              const Icon = tip.icon
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-green-700 dark:text-green-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                        {tip.title}
                      </h4>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {tip.description}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Features Grid */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Available Features
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {features.map((feature, index) => {
                const Icon = feature.icon
                return (
                  <div
                    key={index}
                    className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center hover:shadow-md transition-all"
                  >
                    <Icon className="w-6 h-6 text-green-700 dark:text-green-400 mx-auto mb-2" />
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {feature.text}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-700 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-900 dark:text-green-300 mb-1">
                  Your Security Matters
                </p>
                <p className="text-xs text-green-800 dark:text-green-400">
                  Never share your password. We'll never ask for it via email or phone.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="hidden lg:block w-96 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-gray-800 dark:via-gray-800 dark:to-gray-900 border-r border-gray-200 dark:border-gray-700 p-8 overflow-y-auto sticky top-16 h-[calc(100vh-4rem)] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Registration Guide
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Follow these steps to create your account
          </p>
        </div>

        {/* Promotional Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 to-emerald-700 p-6 text-white shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Special Offer!</h3>
            <p className="text-sm text-green-50 mb-4">
              Open an account today and get $100 welcome bonus + free virtual card
            </p>
            <div className="flex items-center gap-2 text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>No monthly fees</span>
            </div>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="space-y-4">
          {signupGuidance.map((step, index) => {
            const isActive = currentStep === step.step
            const isCompleted = currentStep > step.step

            return (
              <div
                key={step.step}
                className={clsx(
                  'bg-white dark:bg-gray-800 rounded-xl p-5 border-2 transition-all',
                  isActive
                    ? 'border-green-700 dark:border-green-600 shadow-lg'
                    : isCompleted
                    ? 'border-green-300 dark:border-green-800'
                    : 'border-gray-200 dark:border-gray-700'
                )}
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={clsx(
                      'w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0',
                      isActive
                        ? 'bg-green-700 text-white'
                        : isCompleted
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      step.step
                    )}
                  </div>
                  <div className="flex-1">
                    <h3
                      className={clsx(
                        'font-semibold mb-2',
                        isActive
                          ? 'text-green-700 dark:text-green-400'
                          : 'text-gray-900 dark:text-white'
                      )}
                    >
                      {step.title}
                    </h3>
                    <ul className="space-y-2">
                      {step.items.map((item, itemIndex) => (
                        <li
                          key={itemIndex}
                          className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                        >
                          <ChevronRight className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Benefits */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-green-700 dark:text-green-400" />
            Why Choose Us?
          </h3>
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon className="w-5 h-5 text-green-700 dark:text-green-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                      {benefit.title}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Features Grid */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Available Features
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 text-center hover:shadow-md transition-all"
                >
                  <Icon className="w-6 h-6 text-green-700 dark:text-green-400 mx-auto mb-2" />
                  <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {feature.text}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-green-700 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-900 dark:text-green-300 mb-1">
                Secure Registration
              </p>
              <p className="text-xs text-green-800 dark:text-green-400">
                All your information is encrypted and protected. We follow strict security protocols to keep your data safe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
