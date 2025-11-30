'use client'

import Image from 'next/image'
import { Shield, Lock, Eye, AlertTriangle, Fingerprint, Server } from 'lucide-react'

export default function SecuritySection() {
  const securityFeatures = [
    {
      icon: Shield,
      title: 'Bank-Level Encryption',
      description: '256-bit SSL encryption protects all your transactions and personal information.',
    },
    {
      icon: Lock,
      title: 'Multi-Factor Authentication',
      description: 'Additional security layers with biometric and OTP verification for account access.',
    },
    {
      icon: Eye,
      title: 'Real-Time Fraud Detection',
      description: 'Advanced AI monitors your account 24/7 to detect and prevent unauthorized activity.',
    },
    {
      icon: AlertTriangle,
      title: 'Zero Liability Protection',
      description: 'You\'re not responsible for unauthorized transactions when you report them promptly.',
    },
    {
      icon: Fingerprint,
      title: 'Biometric Security',
      description: 'Secure your account with fingerprint, face ID, and voice recognition technology.',
    },
    {
      icon: Server,
      title: 'Secure Infrastructure',
      description: 'Your data is protected in state-of-the-art data centers with redundant security systems.',
    },
  ]

  return (
    <section className="py-24 bg-gradient-to-br from-gray-900 via-green-900 to-emerald-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full mb-6">
            <Shield className="w-5 h-5" />
            <span className="font-semibold">Your Security is Our Priority</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">
            Enterprise-Grade Security
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            We employ industry-leading security measures to keep your financial data and transactions safe
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {securityFeatures.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            )
          })}
        </div>

        {/* Security Badges */}
        <div className="flex flex-wrap items-center justify-center gap-8 pt-12 border-t border-white/20">
          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-green-400" />
            <div>
              <div className="font-bold">FDIC Insured</div>
              <div className="text-sm text-gray-300">Up to $250,000 per account</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Lock className="w-8 h-8 text-green-400" />
            <div>
              <div className="font-bold">PCI DSS Compliant</div>
              <div className="text-sm text-gray-300">Payment card security standards</div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Server className="w-8 h-8 text-green-400" />
            <div>
              <div className="font-bold">SOC 2 Certified</div>
              <div className="text-sm text-gray-300">Highest security compliance</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


