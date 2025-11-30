'use client';

import { useState, useEffect } from 'react';
import { Bell, Clock, CheckCircle, XCircle, Plus, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Profile, Reminder } from '@/types';
import { 
  getTodayReminders, 
  getUpcomingReminders, 
  getMissedReminders, 
  markReminderAsCompleted,
  calculateComplianceRate,
  requestNotificationPermission,
  scheduleNotificationCheck
} from '@/lib/reminder-service';

export default function RemindersPage() {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  useEffect(() => {
    const savedCurrent = localStorage.getItem('currentProfile');
    if (savedCurrent) {
      setCurrentProfile(JSON.parse(savedCurrent));
    }

    // Load reminders
    const savedReminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    setReminders(savedReminders);

    // Check and request notification permission
    requestNotificationPermission().then(granted => {
      setNotificationsEnabled(granted);
      if (granted) {
        scheduleNotificationCheck();
      }
    });
  }, []);

  const todayReminders = getTodayReminders(reminders);
  const upcomingReminders = getUpcomingReminders(reminders);
  const missedReminders = getMissedReminders(reminders);
  const complianceRate = calculateComplianceRate(reminders);

  const handleMarkCompleted = (reminderId: string) => {
    const updatedReminders = markReminderAsCompleted(reminderId, reminders);
    setReminders(updatedReminders);
    localStorage.setItem('reminders', JSON.stringify(updatedReminders));
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const enableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotificationsEnabled(granted);
    if (granted) {
      scheduleNotificationCheck();
    }
  };

  return (
    <AppLayout currentProfile={currentProfile || undefined}>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Medicine Reminders</h2>
          <p className="text-gray-600">Track your daily medication schedule</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-gray-900">{todayReminders.length}</p>
              <p className="text-sm text-gray-600">Today's Doses</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-gray-900">{upcomingReminders.length}</p>
              <p className="text-sm text-gray-600">Upcoming</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
              <p className="text-2xl font-bold text-gray-900">{missedReminders.length}</p>
              <p className="text-sm text-gray-600">Missed</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-gray-900">{complianceRate}%</p>
              <p className="text-sm text-gray-600">Compliance</p>
            </CardContent>
          </Card>
        </div>

        {/* Notifications Setup */}
        {!notificationsEnabled && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-6 h-6 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-900">Enable Push Notifications</p>
                  <p className="text-sm text-yellow-700">Get notified when it's time to take your medicine</p>
                </div>
                <button
                  onClick={enableNotifications}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                >
                  Enable
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Upcoming Today</CardTitle>
              <CardDescription>Your next medicine doses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {upcomingReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-medium text-gray-900">{reminder.medicine_name}</p>
                      <p className="text-sm text-gray-600">{formatTime(reminder.time)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleMarkCompleted(reminder.id)}
                    className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                  >
                    Mark Done
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Missed Reminders */}
        {missedReminders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Missed Today</CardTitle>
              <CardDescription>Medicine doses you missed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {missedReminders.map((reminder) => (
                <div key={reminder.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="font-medium text-gray-900">{reminder.medicine_name}</p>
                      <p className="text-sm text-gray-600">{formatTime(reminder.time)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleMarkCompleted(reminder.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                  >
                    Take Now
                  </button>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* All Today's Reminders */}
        {todayReminders.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Today's Schedule</CardTitle>
              <CardDescription>All your medicine reminders for today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {todayReminders
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((reminder) => {
                    const isMissed = missedReminders.includes(reminder);
                    const isUpcoming = upcomingReminders.includes(reminder);
                    
                    return (
                      <div 
                        key={reminder.id} 
                        className={`flex items-center justify-between p-3 rounded-lg border ${
                          isMissed ? 'bg-red-50 border-red-200' : 
                          isUpcoming ? 'bg-green-50 border-green-200' : 
                          'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isMissed ? (
                            <XCircle className="w-5 h-5 text-red-600" />
                          ) : isUpcoming ? (
                            <Clock className="w-5 h-5 text-green-600" />
                          ) : (
                            <CheckCircle className="w-5 h-5 text-gray-400" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{reminder.medicine_name}</p>
                            <p className="text-sm text-gray-600">
                              {formatTime(reminder.time)} • Daily
                            </p>
                          </div>
                        </div>
                        
                        {!isMissed && !isUpcoming && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-green-600 font-medium">Completed</span>
                          </div>
                        )}
                        
                        {(isMissed || isUpcoming) && (
                          <button
                            onClick={() => handleMarkCompleted(reminder.id)}
                            className={`px-3 py-1 rounded-lg text-sm ${
                              isMissed 
                                ? 'bg-red-600 text-white hover:bg-red-700' 
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {isMissed ? 'Take Now' : 'Mark Done'}
                          </button>
                        )}
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {todayReminders.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Bell className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No reminders today</h3>
              <p className="text-gray-600 mb-4">
                Upload prescriptions to automatically generate medicine reminders
              </p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Upload Prescription
              </button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
