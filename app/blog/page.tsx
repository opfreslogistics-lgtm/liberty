'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import AdvancedNavbar from '@/components/AdvancedNavbar'
import Footer from '@/components/homepage/Footer'
import { 
  Calendar, 
  User,
  Search,
  ArrowRight,
  Tag,
  Clock,
  TrendingUp,
  BookOpen,
  Filter,
  X
} from 'lucide-react'

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const categories = [
    { id: 'all', name: 'All Articles', count: 12 },
    { id: 'banking', name: 'Banking', count: 4 },
    { id: 'investments', name: 'Investments', count: 3 },
    { id: 'security', name: 'Security', count: 2 },
    { id: 'technology', name: 'Technology', count: 3 }
  ]

  const articles = [
    {
      id: 1,
      title: 'The Future of Digital Banking: What to Expect in 2024',
      excerpt: 'Discover the latest trends and innovations shaping the future of digital banking, from AI-powered services to enhanced security measures.',
      category: 'technology',
      author: 'Sarah Johnson',
      date: '2024-01-15',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      featured: true
    },
    {
      id: 2,
      title: 'Smart Investment Strategies for Young Professionals',
      excerpt: 'Learn how to build wealth early with proven investment strategies tailored for young professionals starting their financial journey.',
      category: 'investments',
      author: 'Michael Chen',
      date: '2024-01-12',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=600&fit=crop',
      featured: true
    },
    {
      id: 3,
      title: 'Protecting Your Online Banking: Essential Security Tips',
      excerpt: 'Stay safe online with these essential security tips for protecting your banking information and preventing fraud.',
      category: 'security',
      author: 'Emily Rodriguez',
      date: '2024-01-10',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&h=600&fit=crop',
      featured: false
    },
    {
      id: 4,
      title: 'Understanding Different Types of Savings Accounts',
      excerpt: 'A comprehensive guide to choosing the right savings account that fits your financial goals and lifestyle.',
      category: 'banking',
      author: 'David Thompson',
      date: '2024-01-08',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=600&fit=crop',
      featured: false
    },
    {
      id: 5,
      title: 'How to Build an Emergency Fund: Step-by-Step Guide',
      excerpt: 'Learn the importance of emergency funds and discover practical steps to build one that protects your financial stability.',
      category: 'banking',
      author: 'Lisa Wang',
      date: '2024-01-05',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
      featured: false
    },
    {
      id: 6,
      title: 'Diversification: The Key to a Balanced Investment Portfolio',
      excerpt: 'Understand the principles of diversification and how to create a well-balanced investment portfolio that minimizes risk.',
      category: 'investments',
      author: 'Robert Martinez',
      date: '2024-01-03',
      readTime: '8 min read',
      image: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&h=600&fit=crop',
      featured: false
    },
    {
      id: 7,
      title: 'Mobile Banking Apps: Maximizing Your Banking Experience',
      excerpt: 'Explore the features and benefits of mobile banking apps and how to make the most of your digital banking experience.',
      category: 'technology',
      author: 'Sarah Johnson',
      date: '2023-12-28',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=600&fit=crop',
      featured: false
    },
    {
      id: 8,
      title: 'Retirement Planning: Start Early, Retire Comfortably',
      excerpt: 'Why starting your retirement planning early is crucial and how to set yourself up for a comfortable retirement.',
      category: 'investments',
      author: 'Michael Chen',
      date: '2023-12-25',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop',
      featured: false
    },
    {
      id: 9,
      title: 'Fraud Prevention: Recognizing and Avoiding Scams',
      excerpt: 'Learn to identify common banking scams and protect yourself from fraud with these expert tips and warning signs.',
      category: 'security',
      author: 'Emily Rodriguez',
      date: '2023-12-20',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&h=600&fit=crop',
      featured: false
    },
    {
      id: 10,
      title: 'Business Banking Solutions for Growing Companies',
      excerpt: 'Discover the banking solutions and services designed to help your business grow and manage finances efficiently.',
      category: 'banking',
      author: 'David Thompson',
      date: '2023-12-18',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
      featured: false
    },
    {
      id: 11,
      title: 'Blockchain and Cryptocurrency in Traditional Banking',
      excerpt: 'An overview of how blockchain technology and cryptocurrency are influencing traditional banking institutions.',
      category: 'technology',
      author: 'Sarah Johnson',
      date: '2023-12-15',
      readTime: '9 min read',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop',
      featured: false
    },
    {
      id: 12,
      title: 'The Role of AI in Personal Finance Management',
      excerpt: 'Explore how artificial intelligence is revolutionizing personal finance management and helping individuals make better financial decisions.',
      category: 'technology',
      author: 'Robert Martinez',
      date: '2023-12-12',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&h=600&fit=crop',
      featured: false
    }
  ]

  const filteredArticles = articles.filter(article => {
    const matchesCategory = !selectedCategory || selectedCategory === 'all' || article.category === selectedCategory
    const matchesSearch = !searchQuery || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.author.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const featuredArticles = filteredArticles.filter(article => article.featured)
  const regularArticles = filteredArticles.filter(article => !article.featured)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdvancedNavbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative py-20 lg:py-28 overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-sm font-semibold mb-6">
                <BookOpen className="w-4 h-4" />
                <span>Banking Insights & News</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                Latest{' '}
                <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Banking News
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                Stay informed with expert insights, financial tips, and the latest news from the world of banking and finance.
              </p>

              {/* Search Bar */}
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search articles..."
                    className="w-full pl-12 pr-4 py-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent text-gray-900 dark:text-white text-lg shadow-lg"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Filter */}
        <section className="py-8 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-gray-900/95">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 overflow-x-auto pb-2">
              <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-400">
                <Filter className="w-5 h-5 flex-shrink-0" />
                <span className="font-semibold text-sm">Filter:</span>
              </div>
              <div className="flex items-center space-x-2 flex-1 overflow-x-auto">
                {categories.map((category) => {
                  const isSelected = selectedCategory === category.id || (!selectedCategory && category.id === 'all')
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id === 'all' ? null : category.id)}
                      className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                        isSelected
                          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {category.name} ({category.count})
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Articles */}
        {featuredArticles.length > 0 && (
          <section className="py-16 bg-gradient-to-br from-gray-50 to-purple-50 dark:from-gray-800 dark:to-gray-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center space-x-2 mb-8">
                <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Featured Articles</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                {featuredArticles.map((article) => (
                  <Link
                    key={article.id}
                    href={`/blog/${article.id}`}
                    className="group bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                  >
                    <div className="relative h-64 overflow-hidden">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-800/40 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full">
                          Featured
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <span className="px-2 py-1 bg-purple-600/80 backdrop-blur-sm text-white text-xs font-semibold rounded mb-2 inline-block">
                          {categories.find(c => c.id === article.category)?.name}
                        </span>
                        <h3 className="text-xl font-bold text-white line-clamp-2">
                          {article.title}
                        </h3>
                      </div>
                    </div>
                    <div className="p-6">
                      <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{article.author}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(article.date)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center text-purple-600 dark:text-purple-400 font-semibold group-hover:translate-x-2 transition-transform duration-200">
                        <span>Read More</span>
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Regular Articles Grid */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                All Articles
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                {filteredArticles.length} {filteredArticles.length === 1 ? 'article' : 'articles'} found
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {regularArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/blog/${article.id}`}
                  className="group bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                >
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
                    <div className="absolute bottom-3 left-3 right-3">
                      <span className="px-2 py-1 bg-purple-600/80 backdrop-blur-sm text-white text-xs font-semibold rounded">
                        {categories.find(c => c.id === article.category)?.name}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center space-x-1">
                        <User className="w-3 h-3" />
                        <span>{article.author}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                    <div className="flex items-center text-purple-600 dark:text-purple-400 font-semibold text-sm group-hover:translate-x-2 transition-transform duration-200">
                      <span>Read More</span>
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No articles found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Try adjusting your search or filter criteria.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory(null)
                  }}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Newsletter CTA */}
        <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}></div>
          </div>
          
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Stay Updated
            </h2>
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Subscribe to our newsletter and never miss the latest banking insights, tips, and news.
            </p>
            <div className="max-w-md mx-auto flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-white/95 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button className="px-8 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:shadow-2xl transform hover:scale-105 transition-all duration-200">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer data={{}} />
    </div>
  )
}


