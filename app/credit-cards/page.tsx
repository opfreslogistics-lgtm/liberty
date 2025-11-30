'use client'

import Link from 'next/link'
import Image from 'next/image'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { CreditCard, Gift, Shield, Plane, Star, Zap, Award, DollarSign, CheckCircle2, Quote } from 'lucide-react'

export default function CreditCardsPage() {
  const cards = [
    {
      name: 'Liberty Rewards Platinum',
      icon: Award,
      gradient: 'from-purple-600 to-indigo-700',
      rate: '15.99% - 24.99% APR',
      annual: '$95',
      rewards: '3X points on travel & dining, 1X on all purchases',
      features: ['$200 travel credit', 'Airport lounge access', 'No foreign transaction fees', 'Travel insurance'],
      bestFor: 'Frequent travelers',
      image: 'https://images.unsplash.com/photo-1559526324-593bc073d938?w=800&h=600&fit=crop'
    },
    {
      name: 'Liberty Cash Back',
      icon: DollarSign,
      gradient: 'from-green-600 to-emerald-700',
      rate: '14.99% - 22.99% APR',
      annual: '$0',
      rewards: '3% cash back on gas & groceries, 1% on everything else',
      features: ['No annual fee', 'Intro 0% APR for 12 months', 'Cash back redemption anytime', 'Free credit score'],
      bestFor: 'Everyday spending',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop'
    },
    {
      name: 'Liberty Student Card',
      icon: Star,
      gradient: 'from-blue-600 to-cyan-700',
      rate: '16.99% - 23.99% APR',
      annual: '$0',
      rewards: '2% cash back on streaming & dining, 1% on other',
      features: ['No annual fee', 'Build credit history', 'Late fee forgiven first time', 'Graduation bonus'],
      bestFor: 'Students & new credit',
      image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&h=600&fit=crop'
    },
    {
      name: 'Liberty Business Elite',
      icon: Zap,
      gradient: 'from-orange-600 to-red-700',
      rate: '14.99% - 21.99% APR',
      annual: '$125',
      rewards: '2X points on business purchases, 1.5X everywhere',
      features: ['Employee cards at no cost', 'Expense management tools', 'Business rewards', 'Travel protections'],
      bestFor: 'Business owners',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=600&fit=crop'
    }
  ]

  const benefits = [
    { icon: Shield, title: 'Fraud Protection', desc: 'Zero liability on unauthorized charges' },
    { icon: Gift, title: 'Welcome Bonus', desc: 'Earn up to 50,000 bonus points' },
    { icon: Plane, title: 'Travel Perks', desc: 'No foreign fees & travel insurance' },
    { icon: CreditCard, title: 'Digital Wallet', desc: 'Apple Pay, Google Pay & Samsung Pay' }
  ]

  const testimonials = [
    {
      name: 'David Thompson',
      role: 'Travel Blogger',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop',
      quote: 'The Rewards Platinum card has transformed how I travel. Free lounge access and travel credits make every trip better!',
      rating: 5
    },
    {
      name: 'Lisa Martinez',
      role: 'Accountant',
      image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=400&fit=crop',
      quote: 'Cash back on groceries and gas adds up fast! I\'ve earned over $800 this year alone. Best decision ever.',
      rating: 5
    },
    {
      name: 'James Wilson',
      role: 'College Student',
      image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop',
      quote: 'Perfect first credit card! Building my credit score while earning cash back on streaming services I already use.',
      rating: 5
    }
  ]

  const stats = [
    { value: '$2.5M+', label: 'Rewards Earned Daily' },
    { value: '500K+', label: 'Cardholders' },
    { value: '0%', label: 'Foreign Transaction Fees' },
    { value: '24/7', label: 'Customer Support' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      <section className="relative py-20 lg:py-28 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-semibold mb-6">
                <CreditCard className="w-4 h-4" />
                <span>Premium Credit Cards</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                Credit Cards That{' '}
                <span className="bg-gradient-to-r from-green-600 to-emerald-700 bg-clip-text text-transparent">
                  Reward You
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                Find the perfect card for your lifestyle with competitive rates, amazing rewards, and unbeatable benefits
              </p>
              <div className="flex gap-4">
                <Link href="/signup" className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all">
                  Apply Now
                </Link>
                <Link href="/contact" className="px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:border-purple-600 transition-all shadow-sm">
                  Compare Cards
                </Link>
              </div>
            </div>
            <div className="relative">
              <Image
                src="https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&h=600&fit=crop"
                alt="Credit cards"
                width={800}
                height={600}
                className="rounded-3xl shadow-2xl"
                unoptimized
              />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white via-gray-50 to-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">Choose Your Perfect Card</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">Rewards designed for how you spend</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {cards.map((card, idx) => {
              const Icon = card.icon
              return (
                <div key={idx} className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700">
                  <div className="relative h-56">
                    <Image src={card.image} alt={card.name} width={800} height={600} className="w-full h-full object-cover" unoptimized />
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-90`}></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                      <Icon className="w-16 h-16 mb-4" />
                      <h3 className="text-2xl font-bold mb-2">{card.name}</h3>
                      <p className="text-sm opacity-90">Best for: {card.bestFor}</p>
                    </div>
                  </div>
                  <div className="p-8">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
                      <div className="flex justify-between mb-2 text-sm"><span className="text-gray-600 dark:text-gray-400">APR:</span><span className="font-semibold text-gray-900 dark:text-white">{card.rate}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-600 dark:text-gray-400">Annual Fee:</span><span className="font-semibold text-gray-900 dark:text-white">{card.annual}</span></div>
                    </div>
                    <p className="font-semibold mb-4 text-gray-900 dark:text-white">{card.rewards}</p>
                    <ul className="space-y-2 mb-6">
                      {card.features.map((f, i) => (<li key={i} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><CheckCircle2 className="w-4 h-4 text-green-600" />{f}</li>))}
                    </ul>
                    <Link href="/signup" className="block text-center py-3 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                      Apply Now
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-purple-50/30 dark:from-gray-800 dark:to-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">Card Benefits</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {benefits.map((b, i) => {
              const Icon = b.icon
              return (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 text-center shadow-md hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="font-bold mb-2 text-gray-900 dark:text-white">{b.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{b.desc}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-white">What Our Cardholders Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 shadow-lg border border-gray-100 dark:border-gray-600">
                <div className="flex gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (<Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />))}
                </div>
                <Quote className="w-10 h-10 text-purple-600 dark:text-purple-400 mb-4" />
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <Image src={t.image} alt={t.name} width={50} height={50} className="rounded-full" unoptimized />
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white">{t.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer data={{}} />
    </div>
  )
}
