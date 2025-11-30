'use client'

import { Shield, Globe, Phone, TrendingUp } from 'lucide-react'

interface FeaturesSectionProps {
  data: Record<string, any>
}

const defaultIcons = [Shield, Globe, Phone, TrendingUp]

export default function FeaturesSection({ data }: FeaturesSectionProps) {
  // Meaningful default features - these will always be shown
  const defaultFeatures = [
    { 
      title: 'Enterprise-Grade Security', 
      description: '256-bit SSL encryption, multi-factor authentication, and advanced fraud detection keep your accounts safe and secure at all times',
      DefaultIcon: Shield 
    },
    { 
      title: 'Global Money Transfers', 
      description: 'Send money to over 150 countries with competitive exchange rates and same-day processing for international transactions',
      DefaultIcon: Globe 
    },
    { 
      title: '24/7 Customer Support', 
      description: 'Round-the-clock assistance via phone, live chat, and email from our dedicated expert support team whenever you need help',
      DefaultIcon: Phone 
    },
    { 
      title: 'Investment & Wealth Management', 
      description: 'Comprehensive investment solutions with personalized advice from certified financial advisors to help grow your wealth',
      DefaultIcon: TrendingUp 
    },
  ]

  // Build features array - use customization if available and not placeholder, otherwise use defaults
  const features = []
  
  for (let i = 1; i <= 4; i++) {
    if (data[i]?.title && data[i]?.description) {
      // Check if it's a placeholder value
      const isPlaceholder = 
        data[i].title.toLowerCase().includes('feature') ||
        data[i].title.trim() === `Feature ${i}` ||
        data[i].description.trim() === 'Feature description' ||
        data[i].description.toLowerCase().includes('feature description') ||
        data[i].title.trim().length < 3 ||
        data[i].description.trim().length < 10
      
      if (!isPlaceholder) {
        // Use customization if it's meaningful content
        features.push({
          title: data[i].title,
          description: data[i].description,
          DefaultIcon: defaultIcons[i - 1],
        })
        continue
      }
    }
    // Always use meaningful default if no customization or if customization is placeholder
    features.push(defaultFeatures[i - 1])
  }

  return (
    <section className="py-20 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Why Choose Liberty Bank
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Experience the difference with our advanced banking features and commitment to excellence
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <feature.DefaultIcon className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
