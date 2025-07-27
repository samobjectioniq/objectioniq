'use client';

import { useState } from 'react';
import { LogOut, Clock, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface Customer {
  id: string;
  name: string;
  title: string;
  description: string;
  avatar: string;
  color: string;
}

const customers: Customer[] = [
  {
    id: 'sarah',
    name: 'Sarah Mitchell',
    title: 'Young Professional',
    description: 'Price-conscious tech worker who wants quick solutions',
    avatar: 'SM',
    color: 'blue'
  },
  {
    id: 'robert',
    name: 'Robert Chen',
    title: 'Small Business Owner',
    description: 'Detail-oriented entrepreneur who values relationships',
    avatar: 'RC',
    color: 'green'
  },
  {
    id: 'linda',
    name: 'Linda Rodriguez',
    title: 'Budget-Conscious Teacher',
    description: 'Family-focused educator on a tight budget',
    avatar: 'LR',
    color: 'purple'
  }
];

export default function DashboardPage() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const handlePractice = (customer: Customer) => {
    setSelectedCustomer(customer);
    // Navigate to training with the selected customer
    router.push(`/training?persona=${customer.id}`);
  };

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h2>
          <p className="text-gray-600 mb-6">You need to be signed in to practice.</p>
          <Link href="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <h1 className="text-xl font-bold text-gray-900">ObjectionIQ</h1>
              <Link href="/dashboard" className="text-blue-600 font-medium">Practice</Link>
              <Link href="/sessions" className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1">
                <Clock className="w-4 h-4" />
                My Sessions
              </Link>
            </div>
            <button
              onClick={handleLogout}
              className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Message */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to practice?
          </h2>
          <p className="text-xl text-gray-600">
            Choose your customer:
          </p>
        </div>

        {/* Customer Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {customers.map((customer) => (
            <div
              key={customer.id}
              className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow"
            >
              {/* Customer Avatar */}
              <div className={`bg-${customer.color}-100 p-8 text-center`}>
                <div className={`w-20 h-20 bg-${customer.color}-500 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <span className="text-white text-2xl font-bold">{customer.avatar}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{customer.name}</h3>
                <p className="text-gray-600">{customer.title}</p>
              </div>

              {/* Customer Description */}
              <div className="p-6">
                <p className="text-gray-600 mb-6">{customer.description}</p>
                
                {/* Practice Button */}
                <button
                  onClick={() => handlePractice(customer)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Practice with {customer.name}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Practice Summary</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-600">Sessions Today</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">0</p>
              <p className="text-sm text-gray-600">Total Sessions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">0</p>
              <p className="text-sm text-gray-600">Objections Handled</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 