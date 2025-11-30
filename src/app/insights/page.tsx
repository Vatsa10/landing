'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, Calendar, Activity, Target, AlertCircle } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Profile, LabReport, Prescription } from '@/types';
import { isAuthenticated, getCurrentUser } from '@/lib/auth-middleware';

interface HealthTrend {
  testName: string;
  currentValue: number;
  previousValue: number;
  trend: 'up' | 'down' | 'stable';
  unit: string;
  status: 'normal' | 'high' | 'low';
  dates: string[];
  values: number[];
}

interface HealthScore {
  overall: number;
  categories: {
    blood: number;
    vitamins: number;
    organs: number;
    metabolism: number;
  };
}

export default function InsightsPage() {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [trends, setTrends] = useState<HealthTrend[]>([]);
  const [healthScore, setHealthScore] = useState<HealthScore>({
    overall: 0,
    categories: {
      blood: 0,
      vitamins: 0,
      organs: 0,
      metabolism: 0
    }
  });

  useEffect(() => {
    if (!isAuthenticated()) return;

    const savedCurrent = localStorage.getItem('currentProfile');
    if (savedCurrent) {
      setCurrentProfile(JSON.parse(savedCurrent));
    }

    const savedLabReports = JSON.parse(localStorage.getItem('labReports') || '[]');
    setLabReports(savedLabReports);

    const savedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    setPrescriptions(savedPrescriptions);

    // Calculate trends and health score
    if (savedLabReports.length > 0) {
      calculateTrends(savedLabReports);
      calculateHealthScore(savedLabReports);
    }
  }, []);

  const calculateTrends = (reports: LabReport[]) => {
    // Group lab values by test name
    const testGroups: { [key: string]: { value: number; date: string; status: string }[] } = {};
    
    reports.forEach(report => {
      report.values.forEach(value => {
        if (!testGroups[value.name]) {
          testGroups[value.name] = [];
        }
        testGroups[value.name].push({
          value: value.value,
          date: report.date,
          status: value.status
        });
      });
    });

    // Calculate trends for tests with multiple data points
    const calculatedTrends: HealthTrend[] = [];
    
    Object.keys(testGroups).forEach(testName => {
      const values = testGroups[testName];
      if (values.length >= 2) {
        // Sort by date
        values.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        const currentValue = values[values.length - 1].value;
        const previousValue = values[values.length - 2].value;
        
        let trend: 'up' | 'down' | 'stable';
        const changePercent = ((currentValue - previousValue) / previousValue) * 100;
        
        if (Math.abs(changePercent) < 2) {
          trend = 'stable';
        } else if (changePercent > 0) {
          trend = 'up';
        } else {
          trend = 'down';
        }

        // Determine unit based on test name
        let unit = '';
        if (testName.toLowerCase().includes('glucose') || testName.toLowerCase().includes('sugar')) {
          unit = 'mg/dL';
        } else if (testName.toLowerCase().includes('cholesterol')) {
          unit = 'mg/dL';
        } else if (testName.toLowerCase().includes('hemoglobin')) {
          unit = 'g/dL';
        } else if (testName.toLowerCase().includes('vitamin')) {
          unit = 'ng/mL';
        }

        calculatedTrends.push({
          testName,
          currentValue,
          previousValue,
          trend,
          unit,
          status: values[values.length - 1].status as 'normal' | 'high' | 'low',
          dates: values.map(v => v.date),
          values: values.map(v => v.value)
        });
      }
    });

    setTrends(calculatedTrends);
  };

  const calculateHealthScore = (reports: LabReport[]) => {
    // Simple health score calculation based on latest lab results
    const latestReport = reports[reports.length - 1];
    if (!latestReport) return;

    let bloodScore = 0;
    let vitaminScore = 0;
    let organScore = 0;
    let metabolismScore = 0;
    let totalTests = 0;
    let normalTests = 0;

    latestReport.values.forEach(value => {
      totalTests++;
      if (value.status === 'normal') {
        normalTests++;
      }

      // Categorize tests
      const testName = value.name.toLowerCase();
      if (testName.includes('hemoglobin') || testName.includes('rbc') || testName.includes('wbc') || testName.includes('platelet')) {
        bloodScore += value.status === 'normal' ? 25 : 10;
      } else if (testName.includes('vitamin') || testName.includes('b12') || testName.includes('d')) {
        vitaminScore += value.status === 'normal' ? 25 : 10;
      } else if (testName.includes('liver') || testName.includes('kidney') || testName.includes('ast') || testName.includes('alt') || testName.includes('creatinine')) {
        organScore += value.status === 'normal' ? 25 : 10;
      } else if (testName.includes('glucose') || testName.includes('cholesterol') || testName.includes('triglyceride')) {
        metabolismScore += value.status === 'normal' ? 25 : 10;
      }
    });

    const overallScore = totalTests > 0 ? Math.round((normalTests / totalTests) * 100) : 0;

    setHealthScore({
      overall: overallScore,
      categories: {
        blood: Math.min(100, bloodScore),
        vitamins: Math.min(100, vitaminScore),
        organs: Math.min(100, organScore),
        metabolism: Math.min(100, metabolismScore)
      }
    });
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4" />;
      case 'down':
        return <TrendingDown className="w-4 h-4" />;
      case 'stable':
        return <Minus className="w-4 h-4" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable', testName: string) => {
    // Some tests going up is good, some is bad
    const goodUpTests = ['hemoglobin', 'vitamin d', 'vitamin b12'];
    const goodDownTests = ['glucose', 'cholesterol', 'triglycerides'];
    
    const testLower = testName.toLowerCase();
    
    if (trend === 'stable') return 'text-gray-600';
    
    if (trend === 'up' && goodUpTests.some(test => testLower.includes(test))) {
      return 'text-green-600';
    }
    if (trend === 'down' && goodDownTests.some(test => testLower.includes(test))) {
      return 'text-green-600';
    }
    
    return 'text-red-600';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const currentUser = getCurrentUser();

  if (!isAuthenticated()) {
    return null;
  }

  return (
    <AppLayout currentProfile={currentProfile || undefined}>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Health Insights</h2>
          <p className="text-gray-600">Track your health trends and progress</p>
        </div>

        {/* Health Score Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Overall Health Score
            </CardTitle>
            <CardDescription>
              Based on your latest lab results and trends
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className={`text-3xl font-bold ${getScoreColor(healthScore.overall)}`}>
                  {healthScore.overall}%
                </div>
                <p className="text-sm text-gray-600">Overall</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(healthScore.categories.blood)}`}>
                  {healthScore.categories.blood}%
                </div>
                <p className="text-sm text-gray-600">Blood</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(healthScore.categories.vitamins)}`}>
                  {healthScore.categories.vitamins}%
                </div>
                <p className="text-sm text-gray-600">Vitamins</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(healthScore.categories.organs)}`}>
                  {healthScore.categories.organs}%
                </div>
                <p className="text-sm text-gray-600">Organs</p>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(healthScore.categories.metabolism)}`}>
                  {healthScore.categories.metabolism}%
                </div>
                <p className="text-sm text-gray-600">Metabolism</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Health Trends */}
        {trends.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Health Trends
              </CardTitle>
              <CardDescription>
                How your key health markers are changing over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trends.map((trend, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{trend.testName}</h4>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-sm text-gray-600">
                          Current: {trend.currentValue} {trend.unit}
                        </span>
                        <span className="text-sm text-gray-600">
                          Previous: {trend.previousValue} {trend.unit}
                        </span>
                        <span className={`text-sm font-medium flex items-center gap-1 ${getTrendColor(trend.trend, trend.testName)}`}>
                          {getTrendIcon(trend.trend)}
                          {trend.trend === 'up' && '+'}
                          {Math.round(((trend.currentValue - trend.previousValue) / trend.previousValue) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        trend.status === 'normal' ? 'bg-green-100 text-green-800' :
                        trend.status === 'high' ? 'bg-red-100 text-red-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {trend.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI Health Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              AI Health Summary
            </CardTitle>
            <CardDescription>
              Personalized insights based on your health data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {healthScore.overall >= 80 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Excellent Health Status</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Your overall health score is excellent. Keep maintaining your current lifestyle and continue regular health monitoring.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {healthScore.overall >= 60 && healthScore.overall < 80 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Good Health with Room for Improvement</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        Your health is generally good, but some areas need attention. Consider discussing the abnormal values with your healthcare provider.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {healthScore.overall < 60 && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-red-900">Health Attention Required</h4>
                      <p className="text-sm text-red-700 mt-1">
                        Several health markers need attention. We recommend consulting with your healthcare provider for a comprehensive review.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Trend Analysis */}
              {trends.length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Trend Analysis</h4>
                  <div className="space-y-2">
                    {trends.slice(0, 3).map((trend, index) => (
                      <p key={index} className="text-sm text-blue-700">
                        <strong>{trend.testName}</strong>: {
                          trend.trend === 'up' && trend.currentValue > trend.previousValue ? 
                            'Increasing ' : 
                          trend.trend === 'down' && trend.currentValue < trend.previousValue ? 
                            'Improving ' : 
                            'Stable '
                        }
                        from {trend.previousValue} to {trend.currentValue} {trend.unit}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommendations */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Recommendations</h4>
                <ul className="space-y-1 text-sm text-purple-700">
                  <li>• Continue regular health monitoring every 3-6 months</li>
                  <li>• Maintain a balanced diet rich in nutrients</li>
                  <li>• Stay hydrated with at least 8 glasses of water daily</li>
                  <li>• Exercise regularly for at least 30 minutes, 5 days a week</li>
                  <li>• Ensure adequate sleep of 7-8 hours per night</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty State */}
        {labReports.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Health Data Available</h3>
              <p className="text-gray-600 mb-4">
                Upload lab reports to see your health trends and insights
              </p>
              <button 
                onClick={() => window.location.href = '/records'}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Upload Lab Reports
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
