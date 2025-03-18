
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Clock, AlertCircle, Calendar, ThumbsUp, Info } from 'lucide-react';

type MedicationDetailsProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  medication: {
    name: string;
    dosage?: string;
    frequency?: string;
    purpose?: string;
    sideEffects?: string[];
    instructions?: string;
    nextRefill?: string;
  };
};

const MedicationDetails = ({ open, onOpenChange, medication }: MedicationDetailsProps) => {
  const { isDarkMode } = useTheme();
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "max-w-lg",
        isDarkMode ? "bg-gray-800 text-white border-gray-700" : "bg-white text-gray-800"
      )}>
        <DialogHeader>
          <DialogTitle className={cn(
            "text-xl font-semibold flex items-center gap-2",
            isDarkMode ? "text-white" : "text-gray-800"
          )}>
            {medication.name}
            {medication.dosage && <span className="text-sm font-normal text-gray-500 dark:text-gray-400">({medication.dosage})</span>}
          </DialogTitle>
          <DialogDescription className={cn(
            isDarkMode ? "text-gray-300" : "text-gray-600"
          )}>
            Detailed information about your medication
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {medication.purpose && (
            <div className="flex gap-3">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center",
                isDarkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-600"
              )}>
                <Info size={16} />
              </div>
              <div>
                <h4 className={cn(
                  "text-sm font-medium",
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                )}>Purpose</h4>
                <p className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                )}>{medication.purpose}</p>
              </div>
            </div>
          )}

          {medication.frequency && (
            <div className="flex gap-3">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center",
                isDarkMode ? "bg-green-900 text-green-200" : "bg-green-100 text-green-600"
              )}>
                <Clock size={16} />
              </div>
              <div>
                <h4 className={cn(
                  "text-sm font-medium",
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                )}>How to Take</h4>
                <p className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                )}>{medication.frequency}</p>
              </div>
            </div>
          )}

          {medication.instructions && (
            <div className="flex gap-3">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center",
                isDarkMode ? "bg-purple-900 text-purple-200" : "bg-purple-100 text-purple-600"
              )}>
                <ThumbsUp size={16} />
              </div>
              <div>
                <h4 className={cn(
                  "text-sm font-medium",
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                )}>Special Instructions</h4>
                <p className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                )}>{medication.instructions}</p>
              </div>
            </div>
          )}

          {medication.sideEffects && medication.sideEffects.length > 0 && (
            <div className="flex gap-3">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center",
                isDarkMode ? "bg-amber-900 text-amber-200" : "bg-amber-100 text-amber-600"
              )}>
                <AlertCircle size={16} />
              </div>
              <div>
                <h4 className={cn(
                  "text-sm font-medium",
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                )}>Possible Side Effects</h4>
                <ul className={cn(
                  "text-sm list-disc pl-5 mt-1",
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                )}>
                  {medication.sideEffects.map((effect, index) => (
                    <li key={index}>{effect}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {medication.nextRefill && (
            <div className="flex gap-3">
              <div className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center",
                isDarkMode ? "bg-sky-900 text-sky-200" : "bg-sky-100 text-sky-600"
              )}>
                <Calendar size={16} />
              </div>
              <div>
                <h4 className={cn(
                  "text-sm font-medium",
                  isDarkMode ? "text-gray-200" : "text-gray-700"
                )}>Next Refill</h4>
                <p className={cn(
                  "text-sm",
                  isDarkMode ? "text-gray-300" : "text-gray-600"
                )}>{medication.nextRefill}</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MedicationDetails;
