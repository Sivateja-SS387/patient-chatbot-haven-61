
import React from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Pill, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTheme } from '@/contexts/ThemeContext';

type PatientInfoProps = {
  className?: string;
};

const PatientInfo = ({ className }: PatientInfoProps) => {
  const { isDarkMode } = useTheme();
  const patientInfo = {
    name: 'Nilima',
    birthDate: '09 January 1993',
    age: 31,
    lastVisit: '23 April 2023',
    medications: [
      { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' },
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' },
      { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily' },
    ],
    allergies: ['Penicillin', 'Sulfa drugs'],
    upcomingRefills: [
      { medication: 'Lisinopril', date: '12 June 2023' },
    ]
  };

  return (
    <Card className={cn('overflow-hidden border-0 shadow-md', className)}>
      <CardHeader className="bg-spa-600 text-white p-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
            <User size={24} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">{patientInfo.name}</h2>
            <div className="flex items-center text-sm text-white/80">
              <Calendar size={14} className="mr-1" />
              <span>{patientInfo.birthDate} ({patientInfo.age} years)</span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-2">CURRENT MEDICATIONS</h3>
          <div className="space-y-2">
            {patientInfo.medications.map((med, index) => (
              <motion.div 
                key={index}
                className={cn(
                  "p-3 rounded-lg flex items-center gap-3",
                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                )}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Pill size={18} className="text-spa-500" />
                <div>
                  <div className={cn("font-medium", isDarkMode ? "text-white" : "text-gray-800")}>
                    {med.name} ({med.dosage})
                  </div>
                  <div className={cn("text-sm", isDarkMode ? "text-gray-300" : "text-gray-500")}>
                    {med.frequency}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-2">ALLERGIES</h3>
          <div className="flex flex-wrap gap-2">
            {patientInfo.allergies.map((allergy, index) => (
              <motion.div 
                key={index}
                className={cn(
                  "px-3 py-1 rounded-full text-sm flex items-center",
                  isDarkMode ? "bg-red-900 text-red-200" : "bg-red-50 text-red-600"
                )}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <AlertTriangle size={14} className="mr-1" />
                {allergy}
              </motion.div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-300 mb-2">UPCOMING REFILLS</h3>
          {patientInfo.upcomingRefills.map((refill, index) => (
            <motion.div 
              key={index}
              className={cn(
                "p-3 rounded-lg flex items-center gap-3",
                isDarkMode ? "bg-green-900" : "bg-green-50"
              )}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Clock size={18} className={isDarkMode ? "text-green-200" : "text-green-600"} />
              <div>
                <div className={cn("font-medium", isDarkMode ? "text-white" : "text-gray-800")}>
                  {refill.medication}
                </div>
                <div className={cn(isDarkMode ? "text-green-200" : "text-green-600")}>
                  Due for refill: {refill.date}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientInfo;
