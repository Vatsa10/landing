import { Medicine, Reminder } from '@/types';

export function generateRemindersFromPrescription(
  prescriptionId: string,
  profileId: string,
  medicines: Medicine[],
  prescriptionDate: string
): Reminder[] {
  const reminders: Reminder[] = [];

  medicines.forEach((medicine, index) => {
    // Parse frequency to determine times
    const times = parseFrequency(medicine.frequency);
    
    times.forEach((time, timeIndex) => {
      const reminder: Reminder = {
        id: `${prescriptionId}-${index}-${timeIndex}`,
        profile_id: profileId,
        medicine_name: medicine.name,
        time: time,
        repeat_frequency: 'daily',
        duration_days: medicine.duration_days,
        completed_days: 0,
        created_at: new Date()
      };
      
      reminders.push(reminder);
    });
  });

  return reminders;
}

function parseFrequency(frequency: string): string[] {
  const times: string[] = [];
  const frequencyLower = frequency.toLowerCase();

  // Common frequency patterns
  if (frequencyLower.includes('once daily') || frequencyLower.includes('od')) {
    times.push('08:00'); // Default morning time
  } else if (frequencyLower.includes('twice daily') || frequencyLower.includes('bid')) {
    times.push('08:00', '20:00'); // Morning and evening
  } else if (frequencyLower.includes('three times') || frequencyLower.includes('tid')) {
    times.push('08:00', '14:00', '20:00'); // Morning, afternoon, evening
  } else if (frequencyLower.includes('four times') || frequencyLower.includes('qid')) {
    times.push('08:00', '12:00', '16:00', '20:00'); // Every 4 hours
  } else if (frequencyLower.includes('morning')) {
    times.push('08:00');
  } else if (frequencyLower.includes('evening')) {
    times.push('20:00');
  } else if (frequencyLower.includes('night')) {
    times.push('22:00');
  } else if (frequencyLower.includes('afternoon')) {
    times.push('14:00');
  } else {
    // Extract specific times mentioned in frequency
    const timeMatches = frequency.match(/\b([0-9]{1,2}(:[0-9]{2})?\s*(am|pm|AM|PM))\b/g);
    if (timeMatches) {
      timeMatches.forEach(timeStr => {
        const convertedTime = convertTo24Hour(timeStr);
        if (convertedTime) {
          times.push(convertedTime);
        }
      });
    } else {
      // Default to morning if no pattern matches
      times.push('08:00');
    }
  }

  return times;
}

function convertTo24Hour(timeStr: string): string | null {
  try {
    const cleanTime = timeStr.trim().toUpperCase();
    
    // Handle formats like "8 AM", "8:30 PM", etc.
    const match = cleanTime.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
    if (!match) return null;

    let [, hours, minutes = '00', period] = match;
    let hour = parseInt(hours);

    if (period === 'PM' && hour !== 12) {
      hour += 12;
    } else if (period === 'AM' && hour === 12) {
      hour = 0;
    }

    return `${hour.toString().padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  } catch {
    return null;
  }
}

export function getTodayReminders(reminders: Reminder[]): Reminder[] {
  const today = new Date();
  const daySinceCreation = Math.floor((today.getTime() - new Date(reminders[0]?.created_at || today).getTime()) / (1000 * 60 * 60 * 24));
  
  return reminders.filter(reminder => {
    const daysElapsed = daySinceCreation;
    return daysElapsed < reminder.duration_days;
  });
}

export function getUpcomingReminders(reminders: Reminder[]): Reminder[] {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  return getTodayReminders(reminders).filter(reminder => {
    return reminder.time > currentTime;
  }).sort((a, b) => a.time.localeCompare(b.time));
}

export function getMissedReminders(reminders: Reminder[]): Reminder[] {
  const now = new Date();
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  return getTodayReminders(reminders).filter(reminder => {
    return reminder.time <= currentTime;
  });
}

export function markReminderAsCompleted(reminderId: string, reminders: Reminder[]): Reminder[] {
  return reminders.map(reminder => {
    if (reminder.id === reminderId) {
      return {
        ...reminder,
        completed_days: reminder.completed_days + 1
      };
    }
    return reminder;
  });
}

export function calculateComplianceRate(reminders: Reminder[]): number {
  if (reminders.length === 0) return 0;
  
  const totalPossibleDoses = reminders.reduce((sum, reminder) => {
    return sum + reminder.duration_days;
  }, 0);
  
  const totalCompletedDoses = reminders.reduce((sum, reminder) => {
    return sum + reminder.completed_days;
  }, 0);
  
  return Math.round((totalCompletedDoses / totalPossibleDoses) * 100);
}

// Browser notification utilities
export function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) {
    return Promise.resolve(false);
  }
  
  if (Notification.permission === 'granted') {
    return Promise.resolve(true);
  }
  
  if (Notification.permission !== 'denied') {
    return Notification.requestPermission().then(permission => {
      return permission === 'granted';
    });
  }
  
  return Promise.resolve(false);
}

export function showNotification(title: string, body: string, icon?: string): void {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: icon || '/favicon.ico',
      tag: 'medicine-reminder',
      requireInteraction: true
    });
  }
}

export function scheduleNotificationCheck(): void {
  // Check every minute for upcoming reminders
  setInterval(() => {
    const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
    const upcoming = getUpcomingReminders(reminders);
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    upcoming.forEach(reminder => {
      // Check if reminder time is within the next minute
      const [reminderHour, reminderMinute] = reminder.time.split(':').map(Number);
      const [currentHour, currentMinute] = currentTime.split(':').map(Number);
      
      const reminderTimeMinutes = reminderHour * 60 + reminderMinute;
      const currentTimeMinutes = currentHour * 60 + currentMinute;
      
      if (reminderTimeMinutes - currentTimeMinutes <= 1 && reminderTimeMinutes > currentTimeMinutes) {
        showNotification(
          'Medicine Reminder',
          `Time to take your medicine: ${reminder.medicine_name}`
        );
      }
    });
  }, 60000); // Check every minute
}
