'use client';

import { useState, useEffect } from 'react';
import { Camera, FileText, Plus, Search, Filter, Eye, Download, Upload, Loader2, Calendar } from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Profile, Prescription, LabReport } from '@/types';
import { extractPrescriptionData, extractLabReportData, mockPrescriptionExtraction, mockLabReportExtraction } from '@/lib/ai-extraction';
import { convertFileToBase64, saveFileToLocalStorage } from '@/lib/file-upload';
import { generateRemindersFromPrescription } from '@/lib/reminder-service';
import HealthTimeline from '@/components/timeline/HealthTimeline';

export default function RecordsPage() {
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
  const [activeTab, setActiveTab] = useState<'prescriptions' | 'lab-reports' | 'timeline'>('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<'prescription' | 'lab-report'>('prescription');
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labReports, setLabReports] = useState<LabReport[]>([]);

  useEffect(() => {
    const savedCurrent = localStorage.getItem('currentProfile');
    if (savedCurrent) {
      setCurrentProfile(JSON.parse(savedCurrent));
    }

    // Load saved records
    const savedPrescriptions = localStorage.getItem('prescriptions');
    if (savedPrescriptions) {
      setPrescriptions(JSON.parse(savedPrescriptions));
    }

    const savedLabReports = localStorage.getItem('labReports');
    if (savedLabReports) {
      setLabReports(JSON.parse(savedLabReports));
    }
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentProfile) return;

    setIsUploading(true);
    try {
      const base64 = await convertFileToBase64(selectedFile);
      const fileUrl = saveFileToLocalStorage(selectedFile, `${Date.now()}_${selectedFile.name}`);

      if (uploadType === 'prescription') {
        // Use AI extraction (fallback to mock for demo)
        const extractedData = await mockPrescriptionExtraction(); // Replace with extractPrescriptionData(base64) when API is configured
        
        const newPrescription: Prescription = {
          id: Date.now().toString(),
          profile_id: currentProfile.id,
          date: extractedData.date,
          doctor: extractedData.doctor,
          diagnosis: extractedData.diagnosis,
          medicines: extractedData.medicines,
          follow_up_date: extractedData.follow_up_date,
          file_url: fileUrl,
          createdAt: new Date()
        };

        const updatedPrescriptions = [...prescriptions, newPrescription];
        setPrescriptions(updatedPrescriptions);
        localStorage.setItem('prescriptions', JSON.stringify(updatedPrescriptions));

        // Generate reminders from prescription
        const newReminders = generateRemindersFromPrescription(
          newPrescription.id,
          currentProfile.id,
          extractedData.medicines,
          extractedData.date
        );

        // Save reminders to localStorage
        const existingReminders = JSON.parse(localStorage.getItem('reminders') || '[]');
        const allReminders = [...existingReminders, ...newReminders];
        localStorage.setItem('reminders', JSON.stringify(allReminders));
      } else {
        // Lab report extraction
        const extractedData = await mockLabReportExtraction(); // Replace with extractLabReportData(base64) when API is configured
        
        const newLabReport: LabReport = {
          id: Date.now().toString(),
          profile_id: currentProfile.id,
          date: extractedData.date,
          test_name: extractedData.test_name,
          values: extractedData.values,
          file_url: fileUrl,
          createdAt: new Date()
        };

        const updatedLabReports = [...labReports, newLabReport];
        setLabReports(updatedLabReports);
        localStorage.setItem('labReports', JSON.stringify(updatedLabReports));
      }

      setShowUploadModal(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload and process file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AppLayout currentProfile={currentProfile || undefined}>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Health Records</h2>
          <p className="text-gray-600">Manage prescriptions and lab reports</p>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search records..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="px-4 py-2 border border-gray-300 rounded-lg flex items-center gap-2">
            <Filter size={16} />
            Filter
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'timeline'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Timeline
          </button>
          <button
            onClick={() => setActiveTab('prescriptions')}
            className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'prescriptions'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Prescriptions
          </button>
          <button
            onClick={() => setActiveTab('lab-reports')}
            className={`pb-3 px-1 font-medium text-sm border-b-2 transition-colors ${
              activeTab === 'lab-reports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Lab Reports
          </button>
        </div>

        {/* Quick Upload Actions */}
        <div className="grid grid-cols-2 gap-4">
          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setUploadType('prescription');
              setShowUploadModal(true);
            }}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Camera className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Upload Prescription</h3>
              <p className="text-sm text-gray-600 mt-1">Camera or PDF</p>
            </CardContent>
          </Card>

          <Card 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => {
              setUploadType('lab-report');
              setShowUploadModal(true);
            }}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Upload Lab Report</h3>
              <p className="text-sm text-gray-600 mt-1">Blood tests & more</p>
            </CardContent>
          </Card>
        </div>

        {/* Records List */}
        <div className="space-y-4">
          {activeTab === 'timeline' ? (
            <HealthTimeline
              prescriptions={prescriptions}
              labReports={labReports}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          ) : activeTab === 'prescriptions' ? (
            prescriptions.length > 0 ? (
              prescriptions.map((prescription) => (
                <Card key={prescription.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">Dr. {prescription.doctor}</h3>
                        <p className="text-sm text-gray-600">{prescription.date}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-600 hover:text-blue-600">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-green-600">
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Diagnosis:</p>
                      <p className="text-sm text-gray-600">{prescription.diagnosis}</p>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Medicines:</p>
                      <div className="space-y-1">
                        {prescription.medicines.map((medicine, index) => (
                          <div key={index} className="text-sm bg-gray-50 p-2 rounded">
                            <span className="font-medium">{medicine.name}</span>
                            <span className="text-gray-600 ml-2">{medicine.dosage}</span>
                            <span className="text-gray-500 ml-2">{medicine.frequency}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {prescription.follow_up_date && (
                      <div className="mt-3 text-sm text-blue-600">
                        Follow-up: {prescription.follow_up_date}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No prescriptions yet</p>
                <p className="text-sm mt-1">Upload your first prescription to get started</p>
              </div>
            )
          ) : (
            labReports.length > 0 ? (
              labReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{report.test_name}</h3>
                        <p className="text-sm text-gray-600">{report.date}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 text-gray-600 hover:text-blue-600">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-green-600">
                          <Download size={16} />
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium text-gray-700 mb-2">Test Values:</p>
                      <div className="space-y-1">
                        {report.values.map((value, index) => (
                          <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                            <span className="font-medium">{value.name}</span>
                            <div className="flex items-center gap-2">
                              <span className={value.status === 'high' ? 'text-red-600 font-semibold' : 
                                               value.status === 'low' ? 'text-blue-600 font-semibold' : 
                                               'text-green-600'}>
                                {value.value}
                              </span>
                              <span className="text-gray-500 text-xs">{value.reference_range}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No lab reports yet</p>
                <p className="text-sm mt-1">Upload your first lab report to get started</p>
              </div>
            )
          )}
        </div>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <CardHeader>
                <CardTitle>
                  Upload {uploadType === 'prescription' ? 'Prescription' : 'Lab Report'}
                </CardTitle>
                <CardDescription>
                  {uploadType === 'prescription' 
                    ? 'Take a photo or upload a PDF of your prescription'
                    : 'Upload your lab report PDF or image'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-gray-600 mb-2">
                    {selectedFile ? selectedFile.name : (
                      uploadType === 'prescription' 
                        ? 'Take a photo or choose file'
                        : 'Choose a file or drag and drop'
                    )}
                  </p>
                  <input
                    type="file"
                    accept={uploadType === 'prescription' ? 'image/*,.pdf' : '.pdf,image/*'}
                    className="hidden"
                    id="file-upload"
                    onChange={handleFileSelect}
                  />
                  <label
                    htmlFor="file-upload"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 cursor-pointer"
                  >
                    {selectedFile ? 'Change File' : 'Choose File'}
                  </label>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile || isUploading}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Upload'
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setSelectedFile(null);
                    }}
                    className="flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
