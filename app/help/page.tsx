'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { 
  HelpCircle, 
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
  CreditCard,
  Wallet,
  ArrowRight,
  TrendingUp,
  Building2,
  Shield,
  Globe,
  Phone,
  Mail,
  MessageSquare,
  BookOpen,
  Video,
  Download
} from 'lucide-react'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [
    {
      id: 'getting-started',
      name: 'Getting Started',
      icon: BookOpen,
      description: 'New to Liberty Bank? Start here',
      color: 'from-blue-500 to-blue-600'
    },
    {
      id: 'accounts',
      name: 'Accounts',
      icon: Wallet,
      description: 'Managing your accounts',
      color: 'from-green-500 to-emerald-600'
    },
    {
      id: 'cards',
      name: 'Cards',
      icon: CreditCard,
      description: 'Debit and credit cards',
      color: 'from-purple-500 to-purple-600'
    },
    {
      id: 'transfers',
      name: 'Transfers',
      icon: ArrowRight,
      description: 'Sending and receiving money',
      color: 'from-orange-500 to-orange-600'
    },
    {
      id: 'security',
      name: 'Security',
      icon: Shield,
      description: 'Protecting your account',
      color: 'from-red-500 to-red-600'
    },
    {
      id: 'investments',
      name: 'Investments',
      icon: TrendingUp,
      description: 'Investment services',
      color: 'from-indigo-500 to-indigo-600'
    }
  ]

  const faqs = [
    {
      category: 'getting-started',
      question: 'How do I open an account?',
      answer: 'Opening an account is easy! Simply click the "Open Account" button on our homepage, fill out the registration form with your personal information, verify your identity, and choose your account types. You can select up to 3 account types (checking, savings, business, or fixed deposit). Once approved, you\'ll receive your account details via email.'
    },
    {
      category: 'getting-started',
      question: 'What documents do I need to open an account?',
      answer: 'To open an account, you\'ll need a valid government-issued photo ID (driver\'s license, passport, or national ID), proof of address (utility bill, bank statement, or lease agreement), and your Social Security Number (SSN) or Tax ID. Additional documents may be required for business accounts.'
    },
    {
      category: 'accounts',
      question: 'How do I check my account balance?',
      answer: 'You can check your account balance anytime by logging into your online banking account or mobile app. Your balance is displayed on the dashboard along with all your active accounts. You can also view detailed transaction history and statements.'
    },
    {
      category: 'accounts',
      question: 'Can I have multiple accounts?',
      answer: 'Yes! You can have multiple account types including checking, savings, business, and fixed deposit accounts. During registration, you can select up to 3 account types. Each account will have its own unique account number and balance.'
    },
    {
      category: 'cards',
      question: 'How do I activate my debit card?',
      answer: 'When you receive your debit card in the mail, you can activate it through the mobile app, online banking, or by calling our 24/7 customer service line. You\'ll need your card number and account details to complete the activation process.'
    },
    {
      category: 'cards',
      question: 'What should I do if my card is lost or stolen?',
      answer: 'If your card is lost or stolen, immediately contact our 24/7 customer service or use the mobile app to freeze your card. We\'ll cancel the old card and issue a new one. You\'re protected by our zero liability policy, so you won\'t be responsible for unauthorized transactions.'
    },
    {
      category: 'transfers',
      question: 'How long do transfers take?',
      answer: 'Internal transfers between your own accounts are instant. Domestic transfers to other banks typically take 1-3 business days. International wire transfers usually complete within 1-5 business days depending on the destination country.'
    },
    {
      category: 'transfers',
      question: 'Are there fees for transfers?',
      answer: 'Internal transfers between your own accounts are free. Domestic transfers to other banks may have a small fee. International wire transfers have a standard fee that varies by destination. Check our fee schedule for detailed information.'
    },
    {
      category: 'security',
      question: 'How secure is my information?',
      answer: 'We use bank-level 256-bit SSL encryption to protect all your data and transactions. We also employ multi-factor authentication, real-time fraud monitoring, and follow strict security protocols to ensure your information is always safe.'
    },
    {
      category: 'security',
      question: 'What is two-factor authentication?',
      answer: 'Two-factor authentication (2FA) adds an extra layer of security to your account. In addition to your password, you\'ll need to provide a second verification factor such as a code sent to your phone or email when logging in or making certain transactions.'
    },
    {
      category: 'investments',
      question: 'How do I start investing?',
      answer: 'You can start investing by visiting our Investments page and selecting an investment option that suits your goals. We offer portfolio management, mutual funds, stocks & bonds, and robo-advisor services. Schedule a consultation with one of our investment advisors to get started.'
    },
    {
      category: 'investments',
      question: 'What is the minimum investment amount?',
      answer: 'Minimum investment amounts vary by investment type. Some mutual funds have low minimums starting at $100, while portfolio management services may require higher minimums. Contact our investment team for specific requirements based on your chosen investment option.'
    }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = !selectedCategory || faq.category === selectedCategory
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  const helpResources = [
    {
      icon: Video,
      title: 'Video Tutorials',
      description: 'Watch step-by-step video guides',
      href: '/help/videos'
    },
    {
      icon: FileText,
      title: 'User Guides',
      description: 'Download comprehensive guides',
      href: '/help/guides'
    },
    {
      icon: Download,
      title: 'Mobile App',
      description: 'Download our mobile banking app',
      href: '/services'
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Chat with our support team',
      href: '/contact'
    }
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-semibold mb-6">
                <HelpCircle className="w-4 h-4" />
                <span>Help Center</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                How Can We{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Help You?
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Find answers to common questions, learn how to use our services, and get the support you need.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for help articles..."
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent text-gray-900 dark:text-white text-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Browse by Category
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Find help articles organized by topic
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category, index) => {
                const Icon = category.icon
                const isSelected = selectedCategory === category.id
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(isSelected ? null : category.id)}
                    className={`group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                      isSelected 
                        ? 'border-blue-600 dark:border-blue-500' 
                        : 'border-gray-200 dark:border-gray-700'
                    } text-left`}
                  >
                    <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.description}
                    </p>
                    {isSelected && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {filteredFAQs.length} {filteredFAQs.length === 1 ? 'result' : 'results'} found
              </p>
            </div>

            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-8">
                      {faq.question}
                    </h3>
                    {openFAQ === index ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    )}
                  </button>
                  {openFAQ === index && (
                    <div className="px-6 pb-5 border-t border-gray-200 dark:border-gray-700">
                      <p className="pt-4 text-gray-600 dark:text-gray-400 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredFAQs.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No results found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try searching with different keywords or browse by category above.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory(null)
                  }}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Help Resources */}
        <section className="py-20 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Additional Resources
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Explore more ways to get help and learn about our services
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {helpResources.map((resource, index) => {
                const Icon = resource.icon
                return (
                  <Link
                    key={index}
                    href={resource.href}
                    className="group bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-600"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {resource.description}
                    </p>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* Still Need Help Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Still Need Help?
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Our friendly support team is available 24/7 to assist you with any questions or concerns.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-200"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Contact Support</span>
              </Link>
              <a
                href="tel:+15551234567"
                className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-200"
              >
                <Phone className="w-5 h-5" />
                <span>Call Us Now</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer data={{}} />
    </div>
  )
}


