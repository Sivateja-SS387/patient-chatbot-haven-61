
import React from 'react';
import { motion } from 'framer-motion';
import { User, Calendar, Pill, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type PatientInfoProps = {
  className?: string;
};

const PatientInfo = ({ className }: PatientInfoProps) => {
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
    <div className={cn('bg-white rounded-lg border overflow-hidden', className)}>
      <div className="bg-spa-600 text-white p-4">
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
      </div>
      
      <div className="p-4">
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">CURRENT MEDICATIONS</h3>
          <div className="space-y-2">
            {patientInfo.medications.map((med, index) => (
              <motion.div 
                key={index}
                className="p-3 rounded-lg bg-gray-50 flex items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Pill size={18} className="text-spa-500" />
                <div>
                  <div className="font-medium text-gray-800">{med.name} ({med.dosage})</div>
                  <div className="text-sm text-gray-500">{med.frequency}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <h3 className="text-sm font-medium text-gray-500 mb-2">ALLERGIES</h3>
          <div className="flex flex-wrap gap-2">
            {patientInfo.allergies.map((allergy, index) => (
              <motion.div 
                key={index}
                className="px-3 py-1 rounded-full bg-red-50 text-red-600 text-sm flex items-center"
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
          <h3 className="text-sm font-medium text-gray-500 mb-2">UPCOMING REFILLS</h3>
          {patientInfo.upcomingRefills.map((refill, index) => (
            <motion.div 
              key={index}
              className="p-3 rounded-lg bg-green-50 flex items-center gap-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Clock size={18} className="text-green-600" />
              <div>
                <div className="font-medium text-gray-800">{refill.medication}</div>
                <div className="text-sm text-green-600">Due for refill: {refill.date}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PatientInfo;
