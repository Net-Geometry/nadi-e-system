
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { User, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ProfilePictureUploadDialog from './ProfilePictureUploadDialog';
import { BUCKET_NAME_PROFILEIMAGE, supabase, SUPABASE_URL } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const StaffProfilePicture = () => {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [profilePicture, setProfilePicture] = useState<string | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [userName, setUserName] = useState<string>('');

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Get the staff photo
                const { data: profile, error } = await supabase
                    .from("nd_staff_photo")
                    .select("photo")
                    .eq("user_id", user.id)
                    .single();

                if (error && error.code !== 'PGRST116') throw error;

                if (profile?.photo) {
                    setProfilePicture(`${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME_PROFILEIMAGE}/${profile.photo}`);
                }

                // Get the user name for the avatar fallback
                const { data: userProfile, error: userError } = await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", user.id)
                    .single();
                
                if (userError) throw userError;
                
                if (userProfile?.full_name) {
                    setUserName(userProfile.full_name);
                }
            } catch (error) {
                console.error("Error fetching user profile:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleEditClick = () => {
        setIsDialogOpen(true);
    };

    const handleFilesSelected = (files: File[]) => {
        setSelectedFiles(files);
        if (files.length > 0) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfilePicture(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Get initials for avatar fallback
    const getNameInitial = () => {
        if (userName) {
            return userName.charAt(0).toUpperCase();
        }
        return 'U';
    };

    return (
        <div className="flex flex-col items-center pt-8">
            <div className="relative">
                <Button
                    className="p-0 rounded-full"
                    onClick={handleEditClick}
                >
                    {isLoading ? (
                        <Skeleton className="w-24 h-24 rounded-full" ></Skeleton >
                    ) : (
                        <Avatar className="w-24 h-24">
                            <AvatarImage
                                src={profilePicture}
                                alt="Profile Picture"
                                style={{ objectFit: 'cover' }}
                            />
                            <AvatarFallback className="w-full h-full bg-gray-300 text-gray-900 text-2xl font-semibold">
                                {getNameInitial()}
                            </AvatarFallback>
                        </Avatar>
                    )}
                </Button>
                <Button
                    className="absolute top-6 right-0 p-3 bg-white rounded-full shadow-md"
                    onClick={handleEditClick}
                >
                    <Edit2 className="w-4 h-4 text-gray-600" />
                </Button>
            </div>
            <ProfilePictureUploadDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                onFilesSelected={handleFilesSelected}
            />
        </div>
    );
};

export default StaffProfilePicture;
