'use client';

import { useState } from 'react';
import { Calculator, DollarSign, TrendingUp, AlertTriangle, CheckCircle, ArrowRight, Shield } from 'lucide-react';

interface ROIData {
  monthlyLeads: number;
  leadCost: number;
  currentConversion: number;
  improvedConversion: number;
  averageCommission: number;
}

export default function ROICalculator() {
  const [roiData, setRoiData] = useState<ROIData>({
    monthlyLeads: 500,
    leadCost: 10,
    currentConversion: 5,
    improvedConversion: 8,
    averageCommission: 300
  });

  const [showResults, setShowResults] = useState(false);

  const handleInputChange = (field: keyof ROIData, value: number) => {
    setRoiData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateROI = () => {
    const monthlySpend = roiData.monthlyLeads * roiData.leadCost;
    const currentSales = roiData.monthlyLeads * (roiData.currentConversion / 100);
    const improvedSales = roiData.monthlyLeads * (roiData.improvedConversion / 100);
    
    const currentRevenue = currentSales * roiData.averageCommission;
    const improvedRevenue = improvedSales * roiData.averageCommission;
    
    const revenueIncrease = improvedRevenue - currentRevenue;
    const costPerSaleCurrent = monthlySpend / currentSales;
    const costPerSaleImproved = monthlySpend / improvedSales;
    const costPerSaleSavings = costPerSaleCurrent - costPerSaleImproved;
    
    const wastedLeads = roiData.monthlyLeads - currentSales;
    const savedLeads = improvedSales - currentSales;
    const monthlyWaste = wastedLeads * roiData.leadCost;
    const monthlySavings = savedLeads * roiData.leadCost;

    return {
      monthlySpend,
      currentSales,
      improvedSales,
      currentRevenue,
      improvedRevenue,
      revenueIncrease,
      costPerSaleCurrent,
      costPerSaleImproved,
      costPerSaleSavings,
      wastedLeads,
      savedLeads,
      monthlyWaste,
      monthlySavings
    };
  };

  const results = calculateROI();

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <Calculator className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Your Lead Investment</h3>
          </div>

          <div className="space-y-6">
            {/* Monthly Leads */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Internet Leads
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={roiData.monthlyLeads}
                  onChange={(e) => handleInputChange('monthlyLeads', Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-500"
                  placeholder="500"
                  min="300"
                  max="1000"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  leads/month
                </div>
              </div>
            </div>

            {/* Lead Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cost Per Internet Lead
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </div>
                <input
                  type="number"
                  step="0.01"
                  value={roiData.leadCost}
                  onChange={(e) => handleInputChange('leadCost', Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-500"
                  placeholder="10.00"
                  min="5"
                  max="20"
                />
              </div>
            </div>

            {/* Average Commission */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Average Commission Per Sale
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </div>
                <input
                  type="number"
                  step="10"
                  value={roiData.averageCommission}
                  onChange={(e) => handleInputChange('averageCommission', Number(e.target.value))}
                  className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-500"
                  placeholder="300"
                  min="100"
                  max="1000"
                />
              </div>
            </div>

            {/* Current Conversion Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Close Rate (Industry Average)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={roiData.currentConversion}
                  onChange={(e) => handleInputChange('currentConversion', Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-500"
                  placeholder="5"
                  min="3"
                  max="8"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  %
                </div>
              </div>
            </div>

            {/* Improved Conversion Rate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Improved Close Rate (Top Performers)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  value={roiData.improvedConversion}
                  onChange={(e) => handleInputChange('improvedConversion', Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white placeholder-gray-500"
                  placeholder="8"
                  min="6"
                  max="12"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  %
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowResults(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Calculate My ROI
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">Your Potential Savings</h3>
          </div>

          {showResults ? (
            <div className="space-y-6">
              {/* Monthly Investment */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Monthly Lead Investment</span>
                  <span className="text-lg font-bold text-gray-900">${results.monthlySpend.toLocaleString()}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {roiData.monthlyLeads} leads × ${roiData.leadCost} per lead
                </div>
              </div>

              {/* Current vs Improved Performance */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium text-red-700">Current</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">{results.currentSales}</div>
                  <div className="text-xs text-red-600">sales/month</div>
                  <div className="text-xs text-red-500 mt-1">
                    ${results.costPerSaleCurrent.toFixed(0)} per sale
                  </div>
                  <div className="text-xs text-red-600 mt-1">
                    ${results.currentRevenue.toLocaleString()} revenue
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">With ObjectionIQ</span>
                  </div>
                  <div className="text-2xl font-bold text-green-600">{results.improvedSales}</div>
                  <div className="text-xs text-green-600">sales/month</div>
                  <div className="text-xs text-green-500 mt-1">
                    ${results.costPerSaleImproved.toFixed(0)} per sale
                  </div>
                  <div className="text-xs text-green-600 mt-1">
                    ${results.improvedRevenue.toLocaleString()} revenue
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-700">Additional Sales</span>
                    <span className="text-lg font-bold text-blue-600">+{results.savedLeads}</span>
                  </div>
                  <div className="text-xs text-blue-600">per month</div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-orange-700">Revenue Increase</span>
                    <span className="text-lg font-bold text-orange-600">+${results.revenueIncrease.toLocaleString()}</span>
                  </div>
                  <div className="text-xs text-orange-600">per month</div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-700">Cost Per Sale Savings</span>
                    <span className="text-lg font-bold text-purple-600">-${results.costPerSaleSavings.toFixed(0)}</span>
                  </div>
                  <div className="text-xs text-purple-600">per sale with better objection handling</div>
                </div>
              </div>

              {/* ROI Summary */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
                <h4 className="text-lg font-bold mb-2">Your Internet Lead ROI with ObjectionIQ</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-green-100">Additional Sales</div>
                    <div className="text-xl font-bold">+{results.savedLeads}</div>
                  </div>
                  <div>
                    <div className="text-green-100">Cost Per Sale</div>
                    <div className="text-xl font-bold">${results.costPerSaleCurrent.toFixed(0)} → ${results.costPerSaleImproved.toFixed(0)}</div>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <div className="text-green-100 text-sm">Better objection handling improves your close rate from {roiData.currentConversion}% to {roiData.improvedConversion}% (+{roiData.improvedConversion - roiData.currentConversion}%), creating {results.savedLeads} additional sales and ${results.revenueIncrease.toLocaleString()} additional monthly revenue</div>
                </div>
              </div>

              {/* CTA */}
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-4">
                  Start protecting your lead investment today
                </div>
                <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 mx-auto">
                  <Shield className="w-4 h-4" />
                  Protect My Investment
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calculator className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500">
                Enter your lead investment details to see your potential ROI
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-200">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">75%</div>
          <div className="text-sm text-gray-600">of internet leads don&apos;t answer the phone</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-200">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">5% → 8%</div>
          <div className="text-sm text-gray-600">average to top performer close rate</div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 text-center border border-gray-200">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">$750 → $500</div>
          <div className="text-sm text-gray-600">cost per sale improvement</div>
        </div>
      </div>
    </div>
  );
} 