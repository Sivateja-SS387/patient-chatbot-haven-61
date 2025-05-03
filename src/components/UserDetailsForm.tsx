
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Calendar, Flag, MapPin, Phone, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Extended country codes list with number length requirements
const countryCodes = [
  { code: '+1', name: 'USA/Canada', flag: '🇺🇸', minLength: 10, maxLength: 10 },
  { code: '+44', name: 'UK', flag: '🇬🇧', minLength: 10, maxLength: 10 },
  { code: '+91', name: 'India', flag: '🇮🇳', minLength: 10, maxLength: 10 },
  { code: '+61', name: 'Australia', flag: '🇦🇺', minLength: 9, maxLength: 9 },
  { code: '+49', name: 'Germany', flag: '🇩🇪', minLength: 10, maxLength: 11 },
  { code: '+33', name: 'France', flag: '🇫🇷', minLength: 9, maxLength: 9 },
  { code: '+86', name: 'China', flag: '🇨🇳', minLength: 11, maxLength: 11 },
  { code: '+81', name: 'Japan', flag: '🇯🇵', minLength: 10, maxLength: 10 },
  { code: '+55', name: 'Brazil', flag: '🇧🇷', minLength: 10, maxLength: 11 },
  { code: '+27', name: 'South Africa', flag: '🇿🇦', minLength: 9, maxLength: 9 },
  { code: '+65', name: 'Singapore', flag: '🇸🇬', minLength: 8, maxLength: 8 },
  { code: '+971', name: 'UAE', flag: '🇦🇪', minLength: 9, maxLength: 9 },
  { code: '+52', name: 'Mexico', flag: '🇲🇽', minLength: 10, maxLength: 10 },
  { code: '+82', name: 'South Korea', flag: '🇰🇷', minLength: 10, maxLength: 10 },
  { code: '+39', name: 'Italy', flag: '🇮🇹', minLength: 10, maxLength: 10 },
  { code: '+34', name: 'Spain', flag: '🇪🇸', minLength: 9, maxLength: 9 },
  { code: '+7', name: 'Russia', flag: '🇷🇺', minLength: 10, maxLength: 10 },
  { code: '+64', name: 'New Zealand', flag: '🇳🇿', minLength: 8, maxLength: 9 },
  { code: '+31', name: 'Netherlands', flag: '🇳🇱', minLength: 9, maxLength: 9 },
  { code: '+46', name: 'Sweden', flag: '🇸🇪', minLength: 9, maxLength: 9 },
];

// Create the form schema with dynamic validation based on country code
const createFormSchema = (selectedCountryCode: string) => {
  const selectedCountry = countryCodes.find(country => country.code === selectedCountryCode);
  
  let mobileNumberSchema = z.string().min(1, "Mobile number is required")
    .regex(/^\d+$/, "Mobile number must contain only digits");

  if (selectedCountry) {
    mobileNumberSchema = mobileNumberSchema.refine(
      (val) => val.length >= selectedCountry.minLength && val.length <= selectedCountry.maxLength,
      {
        message: `${selectedCountry.name} phone numbers must be ${
          selectedCountry.minLength === selectedCountry.maxLength
            ? `${selectedCountry.minLength} digits`
            : `between ${selectedCountry.minLength} and ${selectedCountry.maxLength} digits`
        }`
      }
    );
  }

  return z.object({
    dob: z.string().min(1, "Date of birth is required"),
    gender: z.string().min(1, "Gender is required"),
    countryCode: z.string().min(1, "Country code is required"),
    mobileNumber: mobileNumberSchema,
    address: z.string().min(5, "Address must be at least 5 characters"),
  });
};

type FormValues = z.infer<ReturnType<typeof createFormSchema>>;

const UserDetailsForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [selectedCountryCode, setSelectedCountryCode] = useState('+1');

  // Main form
  const form = useForm<FormValues>({
    resolver: zodResolver(createFormSchema(selectedCountryCode)),
    defaultValues: {
      dob: '',
      address: '',
      countryCode: '+1',
      mobileNumber: '',
      gender: '',
    },
  });

  // Update validation when country code changes
  const onCountryCodeChange = (code: string) => {
    setSelectedCountryCode(code);
    form.setValue("countryCode", code);
    form.trigger("mobileNumber"); // Re-trigger validation
  };

  // Get the selected country details
  const selectedCountry = countryCodes.find(country => country.code === selectedCountryCode);
  const phoneHint = selectedCountry ? 
    `${selectedCountry.minLength === selectedCountry.maxLength ? 
      `${selectedCountry.minLength} digits required` : 
      `${selectedCountry.minLength}-${selectedCountry.maxLength} digits required`}` : '';

  const onSubmit = (data: FormValues) => {
    console.log('User data submitted:', data);

    // Combine country code and mobile number for storage
    const fullPhoneNumber = `${data.countryCode} ${data.mobileNumber}`;

    // Store in localStorage for now (in a real app, this would go to the backend)
    const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { 
      ...existingUser, 
      dob: data.dob,
      gender: data.gender,
      mobileNumber: fullPhoneNumber,
      address: data.address,
      hasCompletedOnboarding: true 
    };
    localStorage.setItem('user', JSON.stringify(updatedUser));

    toast({
      title: "Profile completed",
      description: "Your information has been saved successfully",
    });

    // Navigate to dashboard
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="bg-spa-600 text-white">
            <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
            <p>Please provide the following information to complete your account setup</p>
          </CardHeader>
          <CardContent className="p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Personal Information Section - Compact Layout */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold mb-4 dark:text-white">Personal Information</h2>
                  
                  {/* Row 1: DOB and Gender */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="dob"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Date of Birth</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type="date" {...field} className="pl-8" />
                              <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                          </FormControl>
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
                          <div className="relative">
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="pl-8">
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
                            <User className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Row 2: Phone Number and Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Mobile Number with Country Code - Now taking half width */}
                    <div className="grid grid-cols-12 gap-2">
                      <FormField
                        control={form.control}
                        name="countryCode"
                        render={({ field }) => (
                          <FormItem className="col-span-4">
                            <FormLabel>Code</FormLabel>
                            <Select 
                              onValueChange={(value) => onCountryCodeChange(value)} 
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue>
                                    <span>{countryCodes.find(c => c.code === field.value)?.flag || ''} {field.value}</span>
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-[200px]">
                                {countryCodes.map((country) => (
                                  <SelectItem key={country.code} value={country.code}>
                                    <span>{country.flag} {country.code} {country.name}</span>
                                  </SelectItem>
                                ))}
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
                          <FormItem className="col-span-8">
                            <FormLabel>Mobile Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input 
                                  placeholder="Enter mobile number" 
                                  {...field} 
                                  type="tel" 
                                  className="pl-8"
                                />
                                <Phone className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                              </div>
                            </FormControl>
                            {phoneHint && <p className="text-xs text-muted-foreground mt-1">{phoneHint}</p>}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input placeholder="Enter your address" {...field} className="pl-8" />
                              <MapPin className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
