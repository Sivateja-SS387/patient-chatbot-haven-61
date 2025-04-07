
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus, Trash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Form validation schema
const formSchema = z.object({
  dob: z.date({
    required_error: "Date of birth is required",
  }),
  gender: z.string().min(1, "Gender is required"),
  mobileNumber: z.string().min(10, "Mobile number must be at least 10 digits"),
  // Medications and medical history will be handled separately
});

// Medication form schema
const medicationSchema = z.object({
  drugId: z.string().optional(),
  name: z.string().min(1, "Medication name is required"),
  description: z.string().optional(),
  sideEffects: z.string().optional(),
  dateOfIssue: z.date().optional(),
  duration: z.string().optional(),
  isCurrent: z.boolean().optional(),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  specialInstructions: z.string().optional(),
});

// Medical history schema
const medicalHistorySchema = z.object({
  historyId: z.string().optional(),
  prescriptionId: z.string().optional(),
  dateTaken: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;
type MedicationFormValues = z.infer<typeof medicationSchema>;
type MedicalHistoryFormValues = z.infer<typeof medicalHistorySchema>;

const UserDetailsForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [medications, setMedications] = useState<MedicationFormValues[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<MedicalHistoryFormValues[]>([]);
  const [currentMedication, setCurrentMedication] = useState<MedicationFormValues>({
    name: '',
    dosage: '',
    frequency: '',
  });
  const [currentHistory, setCurrentHistory] = useState<MedicalHistoryFormValues>({});

  // Main form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const onSubmit = (data: FormValues) => {
    // Combine all the data
    const userData = {
      ...data,
      medications,
      medicalHistory,
    };

    console.log('User data submitted:', userData);

    // Store in localStorage for now (in a real app, this would go to the backend)
    const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...existingUser, ...userData, hasCompletedOnboarding: true };
    localStorage.setItem('user', JSON.stringify(updatedUser));

    toast({
      title: "Profile completed",
      description: "Your information has been saved successfully",
    });

    // Navigate to dashboard
    navigate('/dashboard');
  };

  // Handle medication form
  const addMedication = () => {
    if (!currentMedication.name || !currentMedication.dosage || !currentMedication.frequency) {
      toast({
        title: "Required fields missing",
        description: "Please fill in the required medication fields",
        variant: "destructive",
      });
      return;
    }

    setMedications([...medications, currentMedication]);
    setCurrentMedication({
      name: '',
      dosage: '',
      frequency: '',
    });
  };

  const removeMedication = (index: number) => {
    const updatedMedications = [...medications];
    updatedMedications.splice(index, 1);
    setMedications(updatedMedications);
  };

  // Handle medical history form
  const addMedicalHistory = () => {
    if (!currentHistory.dateTaken) {
      toast({
        title: "Date is required",
        description: "Please select when the medication was taken",
        variant: "destructive",
      });
      return;
    }

    setMedicalHistory([...medicalHistory, currentHistory]);
    setCurrentHistory({});
  };

  const removeMedicalHistory = (index: number) => {
    const updatedHistory = [...medicalHistory];
    updatedHistory.splice(index, 1);
    setMedicalHistory(updatedHistory);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-spa-600 text-white">
            <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
            <p>Please provide the following information to complete your account setup</p>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Personal Information Section */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 dark:text-white">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="dob"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Date of Birth</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-full pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Select your date of birth</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date() || date < new Date("1900-01-01")
                                }
                                initialFocus
                                className={cn("p-3 pointer-events-auto")}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="non-binary">Non-binary</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="mobileNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your mobile number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Medication Section */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 dark:text-white">Medication Details (if applicable)</h2>
                  
                  {/* Display added medications */}
                  {medications.length > 0 && (
                    <div className="mb-4 space-y-2">
                      <h3 className="text-md font-medium dark:text-gray-300">Added Medications:</h3>
                      <div className="space-y-2">
                        {medications.map((med, index) => (
                          <div 
                            key={index} 
                            className={cn(
                              "p-3 rounded-lg flex items-center justify-between",
                              isDarkMode ? "bg-gray-700" : "bg-gray-50 border"
                            )}
                          >
                            <div>
                              <div className="font-medium dark:text-white">
                                {med.name} - {med.dosage} ({med.frequency})
                              </div>
                              {med.isCurrent && (
                                <span className="text-sm text-spa-500 dark:text-spa-400">Current medication</span>
                              )}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeMedication(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Add new medication form */}
                  <div className={cn(
                    "p-4 rounded-lg mb-4",
                    isDarkMode ? "bg-gray-800" : "bg-gray-50"
                  )}>
                    <h3 className="text-md font-medium mb-3 dark:text-gray-300">Add Medication</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FormLabel htmlFor="med-name">Medication Name</FormLabel>
                        <Input 
                          id="med-name"
                          value={currentMedication.name}
                          onChange={(e) => setCurrentMedication({...currentMedication, name: e.target.value})}
                          placeholder="Enter medication name"
                          className={isDarkMode ? "bg-gray-700 border-gray-600" : ""}
                        />
                      </div>
                      
                      <div>
                        <FormLabel htmlFor="med-id">Drug ID (optional)</FormLabel>
                        <Input 
                          id="med-id"
                          value={currentMedication.drugId || ''}
                          onChange={(e) => setCurrentMedication({...currentMedication, drugId: e.target.value})}
                          placeholder="Enter medication ID"
                          className={isDarkMode ? "bg-gray-700 border-gray-600" : ""}
                        />
                      </div>
                      
                      <div>
                        <FormLabel htmlFor="med-dosage">Dosage</FormLabel>
                        <Input 
                          id="med-dosage"
                          value={currentMedication.dosage}
                          onChange={(e) => setCurrentMedication({...currentMedication, dosage: e.target.value})}
                          placeholder="Example: 10mg"
                          className={isDarkMode ? "bg-gray-700 border-gray-600" : ""}
                        />
                      </div>
                      
                      <div>
                        <FormLabel htmlFor="med-frequency">Frequency</FormLabel>
                        <Input 
                          id="med-frequency"
                          value={currentMedication.frequency}
                          onChange={(e) => setCurrentMedication({...currentMedication, frequency: e.target.value})}
                          placeholder="Example: Once daily"
                          className={isDarkMode ? "bg-gray-700 border-gray-600" : ""}
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <FormLabel htmlFor="med-description">Description (optional)</FormLabel>
                        <Textarea 
                          id="med-description"
                          value={currentMedication.description || ''}
                          onChange={(e) => setCurrentMedication({...currentMedication, description: e.target.value})}
                          placeholder="Enter medication description"
                          className={isDarkMode ? "bg-gray-700 border-gray-600" : ""}
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <FormLabel htmlFor="med-side-effects">Side Effects (optional)</FormLabel>
                        <Textarea 
                          id="med-side-effects"
                          value={currentMedication.sideEffects || ''}
                          onChange={(e) => setCurrentMedication({...currentMedication, sideEffects: e.target.value})}
                          placeholder="List any side effects"
                          className={isDarkMode ? "bg-gray-700 border-gray-600" : ""}
                        />
                      </div>
                      
                      <div className="md:col-span-2">
                        <FormLabel htmlFor="med-instructions">Special Instructions (optional)</FormLabel>
                        <Textarea 
                          id="med-instructions"
                          value={currentMedication.specialInstructions || ''}
                          onChange={(e) => setCurrentMedication({...currentMedication, specialInstructions: e.target.value})}
                          placeholder="Any special instructions for taking this medication"
                          className={isDarkMode ? "bg-gray-700 border-gray-600" : ""}
                        />
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="is-current"
                          checked={currentMedication.isCurrent || false}
                          onChange={(e) => setCurrentMedication({...currentMedication, isCurrent: e.target.checked})}
                          className="h-4 w-4 rounded border-gray-300 text-spa-600 focus:ring-spa-500"
                        />
                        <label 
                          htmlFor="is-current" 
                          className="text-sm font-medium dark:text-gray-300"
                        >
                          This is a current medication
                        </label>
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      className="mt-4"
                      onClick={addMedication}
                    >
                      <Plus size={16} className="mr-1" /> Add Medication
                    </Button>
                  </div>
                </div>

                {/* Medical History Section */}
                <div>
                  <h2 className="text-xl font-semibold mb-4 dark:text-white">Medical History</h2>
                  
                  {/* Display added history entries */}
                  {medicalHistory.length > 0 && (
                    <div className="mb-4 space-y-2">
                      <h3 className="text-md font-medium dark:text-gray-300">Added History:</h3>
                      <div className="space-y-2">
                        {medicalHistory.map((history, index) => (
                          <div 
                            key={index} 
                            className={cn(
                              "p-3 rounded-lg flex items-center justify-between",
                              isDarkMode ? "bg-gray-700" : "bg-gray-50 border"
                            )}
                          >
                            <div className="dark:text-white">
                              {history.dateTaken && format(history.dateTaken, "PPP")}
                              {history.prescriptionId && ` - Prescription: ${history.prescriptionId}`}
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => removeMedicalHistory(index)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Add new history entry form */}
                  <div className={cn(
                    "p-4 rounded-lg mb-4",
                    isDarkMode ? "bg-gray-800" : "bg-gray-50"
                  )}>
                    <h3 className="text-md font-medium mb-3 dark:text-gray-300">Add Medical History Entry</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <FormLabel htmlFor="history-id">History ID (optional)</FormLabel>
                        <Input 
                          id="history-id"
                          value={currentHistory.historyId || ''}
                          onChange={(e) => setCurrentHistory({...currentHistory, historyId: e.target.value})}
                          placeholder="Enter history ID"
                          className={isDarkMode ? "bg-gray-700 border-gray-600" : ""}
                        />
                      </div>
                      
                      <div>
                        <FormLabel htmlFor="prescription-id">Prescription ID (optional)</FormLabel>
                        <Input 
                          id="prescription-id"
                          value={currentHistory.prescriptionId || ''}
                          onChange={(e) => setCurrentHistory({...currentHistory, prescriptionId: e.target.value})}
                          placeholder="Enter prescription ID"
                          className={isDarkMode ? "bg-gray-700 border-gray-600" : ""}
                        />
                      </div>
                      
                      <div>
                        <FormLabel>Date Taken</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !currentHistory.dateTaken && "text-muted-foreground",
                                isDarkMode && "bg-gray-700 border-gray-600"
                              )}
                            >
                              {currentHistory.dateTaken ? (
                                format(currentHistory.dateTaken, "PPP")
                              ) : (
                                <span>Select date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={currentHistory.dateTaken}
                              onSelect={(date) => setCurrentHistory({...currentHistory, dateTaken: date})}
                              disabled={(date) => date > new Date()}
                              initialFocus
                              className={cn("p-3 pointer-events-auto")}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    
                    <Button 
                      type="button" 
                      className="mt-4"
                      onClick={addMedicalHistory}
                    >
                      <Plus size={16} className="mr-1" /> Add History Entry
                    </Button>
                  </div>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full">Complete Profile</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDetailsForm;
