'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, FileText, Calendar, TrendingUp, User } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Profile, Prescription, LabReport } from '@/types';
import { isAuthenticated, getCurrentUser, logout } from '@/lib/auth-middleware';

export default function HomePage() {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Check authentication
    if (!isAuthenticated()) {
      router.push('/auth');
      return;
    }

    // Load current profile and data
    const savedCurrent = localStorage.getItem('currentProfile');
    if (savedCurrent) {
      setCurrentProfile(JSON.parse(savedCurrent));
    }

    const savedPrescriptions = JSON.parse(localStorage.getItem('prescriptions') || '[]');
    setPrescriptions(savedPrescriptions);

    const savedLabReports = JSON.parse(localStorage.getItem('labReports') || '[]');
    setLabReports(savedLabReports);
  }, [router]);

  const handleProfileSwitch = (profile: Profile) => {
    setCurrentProfile(profile);
    localStorage.setItem('currentProfile', JSON.stringify(profile));
  };

  const handleLogout = () => {
    logout();
  };

  const currentUser = getCurrentUser();

  if (!isAuthenticated()) {
    return null; // Will redirect to auth
  }

  return (
    <AppLayout currentProfile={currentProfile || undefined}>
      <div className="p-4 space-y-6">
        {/* Welcome Header */}
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Welcome back, {currentUser?.name || 'User'}!
            </h2>
            <p className="text-gray-600">Your health at a glance</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg"
          >
            Logout
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-gray-900">{prescriptions.length}</p>
              <p className="text-sm text-gray-600">Prescriptions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Camera className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-gray-900">{labReports.length}</p>
              <p className="text-sm text-gray-600">Lab Reports</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-600">Upcoming</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold text-gray-900">85%</p>
              <p className="text-sm text-gray-600">Compliance</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push('/records')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Camera className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Upload Prescription</h4>
                    <p className="text-sm text-gray-600">Add a new prescription with AI extraction</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push('/records')}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Upload Lab Report</h4>
                    <p className="text-sm text-gray-600">Add lab results with automatic analysis</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Records */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Records</h3>
          <div className="space-y-3">
            {[...prescriptions, ...labReports]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 3)
              .map((record) => (
                <Card key={record.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {'doctor' in record ? `Dr. ${record.doctor}` : record.test_name}
                        </h4>
                        <p className="text-sm text-gray-600">{record.date}</p>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          'doctor' in record 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {'doctor' in record ? 'Prescription' : 'Lab Report'}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        {/* Profile Switcher */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Family Members</h3>
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => router.push('/profile')}
              className="flex-shrink-0 p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400"
            >
              <User className="w-6 h-6 text-gray-400" />
              <p className="text-xs text-gray-500 mt-1">Add Member</p>
            </button>
            
            {/* This would be populated with actual profiles */}
            <div className="flex-shrink-0 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <User className="w-6 h-6 text-blue-600" />
              <p className="text-xs text-blue-700 mt-1">Self</p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
