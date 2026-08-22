import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Employee, UserRole } from '../../types/employee';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { toast } from '../ui/Toast';
import { useEmployees } from '../../hooks/useEmployees';
import { Camera, Save, X, User } from 'lucide-react';
import { getInitials } from '../../lib/utils';

const profileSchema = z.object({
  fullName: z.string().min(2, 'Name is required'),
  phone: z.string().min(7, 'Please provide a valid phone number'),
  address: z.string().min(5, 'Please provide a valid street address'),
  jobTitle: z.string().min(2, 'Job title is required'),
  department: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface ProfileEditFormProps {
  employee: Employee;
  userRole: UserRole;
  onCancel: () => void;
  onSaved: () => void;
}

export function ProfileEditForm({ employee, userRole, onCancel, onSaved }: ProfileEditFormProps) {
  const { updateProfile, uploadProfilePicture, isUpdating } = useEmployees();
  const [avatarPreview, setAvatarPreview] = useState(employee.profilePictureUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const isAdmin = userRole === 'admin';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: employee.fullName,
      phone: employee.phone || '+1 (555) 000-0000',
      address: employee.address || 'San Francisco, CA',
      jobTitle: employee.jobTitle || 'Associate',
      department: employee.department || 'Operations',
    },
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      let finalAvatarUrl = employee.profilePictureUrl;
      if (avatarFile) {
        finalAvatarUrl = await uploadProfilePicture(avatarFile);
      }

      await updateProfile({
        id: employee.id,
        data: {
          phone: data.phone,
          address: data.address,
          profilePictureUrl: finalAvatarUrl,
          ...(isAdmin && {
            fullName: data.fullName,
            jobTitle: data.jobTitle,
            department: data.department,
          }),
        },
      });

      toast('Profile Updated', 'Your profile details have been saved successfully.', 'success');
      onSaved();
    } catch (err: any) {
      toast('Update Failed', err.message || 'Failed to update profile', 'error');
    }
  };

  return (
    <Card className="p-6 sm:p-8">
      <CardHeader className="px-0 pt-0 pb-6 border-b border-zinc-100">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Edit Employee Profile</CardTitle>
            <p className="text-xs text-zinc-500 mt-1">
              {isAdmin
                ? 'Administrator permission: Full field editing enabled'
                : 'Employee view: You can modify your phone number, address, and profile photo'}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel} className="p-2">
            <X className="w-4 h-4 text-zinc-400" />
          </Button>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-6">
        {/* Avatar Upload */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-zinc-900 text-white flex items-center justify-center font-bold text-xl overflow-hidden shadow-sm">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                getInitials(employee.fullName)
              )}
            </div>
            <label
              htmlFor="avatar-input"
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-zinc-900 text-white hover:bg-zinc-800 shadow-md cursor-pointer transition-colors"
            >
              <Camera className="w-3.5 h-3.5" />
              <input
                id="avatar-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </label>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-zinc-900">Profile Photo</h4>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              JPG, PNG or WEBP. Max size 2MB.
            </p>
          </div>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full Name"
            disabled={!isAdmin}
            error={errors.fullName?.message}
            {...register('fullName')}
          />

          <Input
            label="Company Email"
            value={employee.email}
            disabled
            helperText="Company email address is locked"
          />

          <Input
            label="Job Title"
            disabled={!isAdmin}
            error={errors.jobTitle?.message}
            {...register('jobTitle')}
          />

          {isAdmin ? (
            <Select label="Department" {...register('department')}>
              <option value="Engineering">Engineering</option>
              <option value="Product">Product</option>
              <option value="People & Ops">People & Ops</option>
              <option value="Operations">Operations</option>
            </Select>
          ) : (
            <Input
              label="Department"
              value={employee.department || 'Operations'}
              disabled
            />
          )}

          <Input
            label="Phone Number"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Input
            label="Office / Address"
            error={errors.address?.message}
            {...register('address')}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-100">
          <Button type="button" variant="secondary" size="md" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" isLoading={isUpdating} className="gap-2">
            <Save className="w-4 h-4" /> Save Profile
          </Button>
        </div>
      </form>
    </Card>
  );
}
