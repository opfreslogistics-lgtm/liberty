'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Calendar, ArrowRight, Clock } from 'lucide-react'

interface NewsSectionProps {
  data: Record<string, any>
}

export default function NewsSection({ data }: NewsSectionProps) {
  const news = [
    {
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
      category: 'Financial Tips',
      title: '5 Essential Financial Planning Strategies for 2024',
      excerpt: 'Learn how to secure your financial future with these proven strategies from our expert advisors.',
      date: 'March 15, 2024',
      readTime: '5 min read',
    },
    {
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      category: 'Investment',
      title: 'The Complete Guide to Building Your Investment Portfolio',
      excerpt: 'Discover how to diversify your investments and maximize returns while minimizing risk.',
      date: 'March 10, 2024',
      readTime: '8 min read',
    },
    {
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      category: 'Banking',
      title: 'New Security Features: Enhanced Protection for Your Accounts',
      excerpt: 'We\'ve upgraded our security systems with advanced AI-powered fraud detection.',
      date: 'March 5, 2024',
      readTime: '4 min read',
    },
    {
      image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop',
      category: 'Business',
      title: 'How Small Businesses Can Optimize Cash Flow Management',
      excerpt: 'Essential tips for managing your business finances more effectively and improving cash flow.',
      date: 'February 28, 2024',
      readTime: '6 min read',
    },
    {
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop',
      category: 'Technology',
      title: 'Revolutionizing Banking: The Future of Digital Payments',
      excerpt: 'Explore the latest innovations in digital payment technology and how they benefit you.',
      date: 'February 22, 2024',
      readTime: '7 min read',
    },
    {
      image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&h=600&fit=crop',
      category: 'Retirement',
      title: 'Planning for Retirement: Start Early, Retire Comfortably',
      excerpt: 'Key strategies to ensure a secure and comfortable retirement regardless of your age.',
      date: 'February 15, 2024',
      readTime: '9 min read',
    },
  ]

  return (
    <section className="py-24 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Latest News & Insights
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Stay informed with expert financial advice, market insights, and banking updates
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((article, index) => (
            <Link
              key={index}
              href="/blog"
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            >
              {/* Image */}
              <div className="relative h-56 w-full overflow-hidden">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                  unoptimized
                />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-green-700 rounded-full text-sm font-semibold">
                    {article.category}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>{article.date}</span>
                  <span className="mx-2">•</span>
                  <Clock className="w-4 h-4 mr-2" />
                  <span>{article.readTime}</span>
                </div>

                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2">
                  {article.title}
                </h3>

                <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {article.excerpt}
                </p>

                <div className="flex items-center text-green-600 dark:text-green-400 font-semibold group-hover:translate-x-2 transition-transform">
                  <span>Read Article</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Link
            href="/blog"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200"
          >
            <span>View All Articles</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  )
}


