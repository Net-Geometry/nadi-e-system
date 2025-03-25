import { useState } from 'react';
import { BUCKET_NAME_PROFILEIMAGE, supabase, SUPABASE_URL } from '@/integrations/supabase/client';
import useStaffID from '@/hooks/use-staff-id';

const useProfilePictureUpload = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { staffID, loading: isStaffIDLoading, error: staffIDError } = useStaffID();

    const uploadProfilePicture = async (file: File) => {
        if (isStaffIDLoading) return;
        if (staffIDError) {
            setError(staffIDError);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("User not authenticated");

            const fileExt = file.name.split('.').pop();
            const filePath = `staff/${user.id}/profile.${fileExt}`;
            const fileSize = file.size / 1024; // size in KB

            // Upload file to storage
            const { error: uploadError } = await supabase.storage
                .from('profileimage')
                .upload(filePath, file, { upsert: true });

            if (uploadError) throw uploadError;

            // Check if user already has a profile picture
            const { data: existingProfile, error: selectError } = await supabase
                .from('nd_staff_photo')
                .select('photo')
                .eq('user_id', user.id)
                .single();

            if (selectError && selectError.code !== 'PGRST116') throw selectError;

            // Delete the existing file in the bucket if it exists
            if (existingProfile && existingProfile.photo) {
                const { error: deleteError } = await supabase.storage
                    .from('profileimage')
                    .remove([existingProfile.photo]);

                if (deleteError) throw deleteError;
            }

            const profileData = {
                photo: filePath,
                ext: fileExt,
                size: fileSize.toString(),
                is_active: true,
                staff_id: staffID,
            };

            // Insert or update profile picture in the database
            if (existingProfile) {
                const { error: updateError } = await supabase
                    .from('nd_staff_photo')
                    .update(profileData)
                    .eq('user_id', user.id);

                if (updateError) throw updateError;
            } else {
                const { error: insertError } = await supabase
                    .from('nd_staff_photo')
                    .insert({ 
                        user_id: user.id, 
                        ...profileData, 
                        created_at: new Date().toISOString(), 
                        updated_at: new Date().toISOString() 
                    });

                if (insertError) throw insertError;
            }

            return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME_PROFILEIMAGE}/${filePath}`;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return { uploadProfilePicture, isLoading, error };
};

export default useProfilePictureUpload;