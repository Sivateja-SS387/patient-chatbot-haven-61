
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Edit2, Save } from 'lucide-react';

const EditableProfile = () => {
  const { toast } = useToast();
  const { isDarkMode } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: 'Nilima',
    email: 'nilima.v9@gmail.com',
    dob: '09 January 1993',
    phone: '+1 (555) 123-4567'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    toast({
      title: "Profile updated",
      description: "Your profile information has been saved."
    });
  };

  const toggleEdit = () => {
    setIsEditing(prev => !prev);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold dark:text-white">My Profile</h2>
        <Button 
          variant={isEditing ? "outline" : "default"} 
          size="sm" 
          onClick={toggleEdit}
          className={isEditing ? "border-gray-300 dark:border-gray-600" : ""}
        >
          {isEditing ? (
            <>Cancel</>
          ) : (
            <>
              <Edit2 className="mr-1 h-4 w-4" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input 
                id="fullName" 
                name="fullName" 
                value={formData.fullName} 
                onChange={handleChange}
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                value={formData.email} 
                onChange={handleChange}
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dob">Date of Birth</Label>
              <Input 
                id="dob" 
                name="dob" 
                value={formData.dob} 
                onChange={handleChange}
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input 
                id="phone" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange}
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
            <Button type="submit" className="mt-4">
              <Save className="mr-1 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <span className={cn("text-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>
              Full Name
            </span>
            <span className="font-medium dark:text-white">{formData.fullName}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className={cn("text-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>
              Email
            </span>
            <span className="font-medium dark:text-white">{formData.email}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className={cn("text-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>
              Date of Birth
            </span>
            <span className="font-medium dark:text-white">{formData.dob}</span>
          </div>
          <div className="flex flex-col gap-1">
            <span className={cn("text-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>
              Phone
            </span>
            <span className="font-medium dark:text-white">{formData.phone}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableProfile;
