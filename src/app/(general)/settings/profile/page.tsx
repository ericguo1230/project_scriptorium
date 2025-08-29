"use client";
import { Status } from "@/app/actions";
import { updateProfile } from "@/actions/profileActions";
import { useFormState } from "react-dom";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { CameraIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useSession } from "@/context/sessionProvider";
import Image from "next/image";

export default function Page() {
  const session = useSession();
  
  const router = useRouter();
  const initialState = { type: "default" } as Status;
  const [state, formAction] = useFormState<Status, FormData>(updateProfile, initialState);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (state.type === "success") {
      toast.success("Profile updated");
      router.push("/");
    } else if (state.type === "error") {
      toast.error(state.message || "Failed to update profile");
      setIsSubmitting(false);
    }
    state.type = initialState.type;
  }, [initialState.type, state, router]);

  const handleSubmit = (formData: FormData) => {
    setIsSubmitting(true);
    formAction(formData);
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      
      // Validate file size (e.g., 5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(null);
    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="card max-w-2xl mx-auto bg-base-200">
      <div className="card-body">
        <div className="card-title text-center">
          <div className="text-3xl font-bold">Your Profile</div>
        </div>

          <form action={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center mb-8">
              <div className="relative mb-4 group flex flex-col justify-center items-center">
                {avatarPreview ? (
                  <div className="relative">
                    <Image 
                      src={avatarPreview}
                      alt="Avatar preview"
                      className="w-32 h-32 rounded-full object-cover"
                      width={512}
                      height={512}
                    />
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    <Image 
                      src={session.session!.avatar}
                      alt="Avatar"
                      className="object-cover w-full h-full"
                      width={512}
                      height={512}
                    />
                  </div>
                )}
                
                <label className="block mt-4">
                  <div className="btn btn-secondary flex items-center gap-2">
                    <CameraIcon className="w-4 h-4" />
                    {avatarPreview ? 'Change Photo' : 'Upload Photo'}
                  </div>
                  <input
                    type="file"
                    name="avatar"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Supported formats: JPG, PNG, GIF (max. 5MB)
                </p>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={session.session!.firstName}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={session.session!.lastName}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  name="email"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={session.session!.email}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Phone Number</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder={session.session!.phoneNumber || 'Enter phone number'}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                className="btn btn-primary min-w-[150px]"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading loading-spinner loading-md"></span>
                    Updating...
                  </>
                ) : (
                  'Update Profile'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
