'use client';

import { useState, useMemo } from 'react';
import { Calendar, Search, Filter, FileText, Activity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Prescription, LabReport } from '@/types';

interface HealthTimelineProps {
  prescriptions: Prescription[];
  labReports: LabReport[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

interface TimelineItem {
  id: string;
  date: string;
  type: 'prescription' | 'lab-report';
  title: string;
  description: string;
  details: any;
  color: string;
}

export default function HealthTimeline({ 
  prescriptions, 
  labReports, 
  searchQuery, 
  onSearchChange 
}: HealthTimelineProps) {
  const [filterType, setFilterType] = useState<'all' | 'prescriptions' | 'lab-reports'>('all');
  const [dateRange, setDateRange] = useState<'all' | 'week' | 'month' | 'year'>('all');

  // Combine and sort timeline items
  const timelineItems = useMemo(() => {
    const items: TimelineItem[] = [];

    // Add prescriptions
    prescriptions.forEach(prescription => {
      items.push({
        id: prescription.id,
        date: prescription.date,
        type: 'prescription',
        title: `Prescription by Dr. ${prescription.doctor}`,
        description: prescription.diagnosis,
        details: prescription,
        color: 'blue'
      });
    });

    // Add lab reports
    labReports.forEach(report => {
      items.push({
        id: report.id,
        date: report.date,
        type: 'lab-report',
        title: report.test_name,
        description: `${report.values.length} tests performed`,
        details: report,
        color: 'green'
      });
    });

    // Sort by date (newest first)
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [prescriptions, labReports]);

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    let filtered = timelineItems;

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(item => 
        filterType === 'prescriptions' ? item.type === 'prescription' : item.type === 'lab-report'
      );
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        // Search in title, description, and details
        if (item.title.toLowerCase().includes(query) || 
            item.description.toLowerCase().includes(query)) {
          return true;
        }

        // Search in prescription details
        if (item.type === 'prescription') {
          const prescription = item.details as Prescription;
          return prescription.doctor.toLowerCase().includes(query) ||
                 prescription.diagnosis.toLowerCase().includes(query) ||
                 prescription.medicines.some((med: any) => 
                   med.name.toLowerCase().includes(query)
                 );
        }

        // Search in lab report details
        if (item.type === 'lab-report') {
          const report = item.details as LabReport;
          return report.test_name.toLowerCase().includes(query) ||
                 report.values.some((value: any) => 
                   value.name.toLowerCase().includes(query)
                 );
        }

        return false;
      });
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (dateRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter(item => 
        new Date(item.date) >= cutoffDate
      );
    }

    return filtered;
  }, [timelineItems, searchQuery, filterType, dateRange]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search records: Vitamin D, Thyroid, Dr Sharma..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2">
            <Filter size={16} />
            Filter
          </button>
        </div>

        {/* Filter Options */}
        <div className="flex gap-3 flex-wrap">
          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                filterType === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              All Records
            </button>
            <button
              onClick={() => setFilterType('prescriptions')}
              className={`px-3 py-1 rounded-full text-sm ${
                filterType === 'prescriptions' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Prescriptions
            </button>
            <button
              onClick={() => setFilterType('lab-reports')}
              className={`px-3 py-1 rounded-full text-sm ${
                filterType === 'lab-reports' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Lab Reports
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setDateRange('all')}
              className={`px-3 py-1 rounded-full text-sm ${
                dateRange === 'all' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setDateRange('week')}
              className={`px-3 py-1 rounded-full text-sm ${
                dateRange === 'week' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              This Week
            </button>
            <button
              onClick={() => setDateRange('month')}
              className={`px-3 py-1 rounded-full text-sm ${
                dateRange === 'month' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setDateRange('year')}
              className={`px-3 py-1 rounded-full text-sm ${
                dateRange === 'year' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              This Year
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Timeline indicator */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    item.color === 'blue' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {item.type === 'prescription' ? (
                      <FileText className={`w-5 h-5 ${item.color === 'blue' ? 'text-blue-600' : 'text-green-600'}`} />
                    ) : (
                      <Activity className={`w-5 h-5 ${item.color === 'blue' ? 'text-blue-600' : 'text-green-600'}`} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-gray-900">{item.title}</h3>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{formatDate(item.date)}</p>
                        <p className="text-xs text-gray-500">{getRelativeTime(item.date)}</p>
                      </div>
                    </div>

                    {/* Additional Details */}
                    {item.type === 'prescription' && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-900 mb-1">Medicines:</p>
                        <div className="space-y-1">
                          {(item.details as Prescription).medicines.slice(0, 2).map((med: any, index: number) => (
                            <p key={index} className="text-sm text-blue-700">
                              {med.name} - {med.dosage} - {med.frequency}
                            </p>
                          ))}
                          {(item.details as Prescription).medicines.length > 2 && (
                            <p className="text-sm text-blue-600">
                              +{(item.details as Prescription).medicines.length - 2} more medicines
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {item.type === 'lab-report' && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-900 mb-1">Key Results:</p>
                        <div className="space-y-1">
                          {(item.details as LabReport).values.slice(0, 2).map((value: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-green-700">{value.name}</span>
                              <span className={`font-medium ${
                                value.status === 'high' ? 'text-red-600' : 
                                value.status === 'low' ? 'text-blue-600' : 
                                'text-green-600'
                              }`}>
                                {value.value}
                              </span>
                            </div>
                          ))}
                          {(item.details as LabReport).values.length > 2 && (
                            <p className="text-sm text-green-600">
                              +{(item.details as LabReport).values.length - 2} more tests
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'Try adjusting your search terms' : 'Start by uploading your first prescription or lab report'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
