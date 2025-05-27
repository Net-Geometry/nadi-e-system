import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import useGeneralData from "@/hooks/use-general-data";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { updateMemberProfile } from "@/components/profile/hook/use-member-profile";
import { useUserMetadata } from "@/hooks/use-user-metadata";

interface ProfileEditDialogMemberProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    profileData: any;
    onSave: (updatedData: any) => void;
}

const ProfileEditDialogMember: React.FC<ProfileEditDialogMemberProps> = ({
    open,
    onOpenChange,
    profileData,
    onSave,
}) => {
    const { toast } = useToast();
    const { races, nationalities, genders, ethnics, occupations, typeSectors, ictKnowledge, educationLevels, statusMemberships } = useGeneralData();
    const [formState, setFormState] = useState<any>({});
    const userMetadata = useUserMetadata();
    const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
    const userGroup = parsedMetadata?.user_group;
    const userType = parsedMetadata?.user_type;

    useEffect(() => {
        if (open) {
            setFormState(profileData || {});
        }
    }, [open, profileData, userGroup, userType]);

    const setField = (field: string, value: any) => {
        setFormState((prevState) => ({ ...prevState, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            // Call the updateMemberProfile function with the updated formState
            await updateMemberProfile(formState.user_id, {
                fullname: formState.fullname,
                identity_no: formState.identity_no,
                mobile_no: formState.mobile_no,
                email: formState.email,
                dob: formState.dob,
                race_id: formState.race_id?.id,
                nationality_id: formState.nationality_id?.id,
                gender: formState.gender?.id,
                community_status: formState.community_status,
                ethnic_id: formState.ethnic_id?.id,
                occupation_id: formState.occupation_id?.id,
                type_sector: formState.type_sector?.id,
                ict_knowledge: formState.ict_knowledge?.id,
                education_level: formState.education_level?.id,
                oku_status: formState.oku_status,
                join_date: formState.join_date,
                status_membership: formState.status_membership?.id,
                status_entrepreneur: formState.status_entrepreneur,
            });

            toast({
                title: "Success",
                description: "Profile updated successfully.",
            });

            // Call the onSave callback to update the parent component
            onSave(formState);

            // Close the dialog
            onOpenChange(false);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to update profile.",
                variant: "destructive",
            });
        }
    };


    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Profile Member</DialogTitle>
                    <DialogDescription>Update your profile details below.</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(userType === "super_admin" || userGroup ===9 || userGroup ===3) && (
                            <>
                                <div>
                                    <Label htmlFor="fullname">Full Name</Label>
                                    <Input
                                        id="fullname"
                                        value={formState.fullname || ""}
                                        onChange={(e) => setField("fullname", e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="identity_no">IC Number</Label>
                                    <Input
                                        id="identity_no"
                                        value={formState.identity_no || ""}
                                        onChange={(e) => setField("identity_no", e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="gender">Gender</Label>
                                    <Select
                                        name="gender"
                                        value={formState.gender?.id?.toString() || ""}
                                        onValueChange={(value) =>
                                            setField(
                                                "gender",
                                                genders.find((gender) => gender.id.toString() === value)
                                            )
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {genders.map((gender) => (
                                                <SelectItem key={gender.id} value={gender.id.toString()}>
                                                    {gender.eng}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}
                        {(userType === "super_admin" || userGroup === 7  || userGroup ===9 || userGroup ===3) && (
                            <>
                                <div>
                                    <Label htmlFor="mobile_no">Mobile Number</Label>
                                    <Input
                                        id="mobile_no"
                                        type="tel"
                                        value={formState.mobile_no || ""}
                                        onChange={(e) => setField("mobile_no", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formState.email || ""}
                                        onChange={(e) => setField("email", e.target.value)}
                                    />
                                </div>
                            </>
                        )}
                        {(userType === "super_admin" || userGroup ===9 || userGroup ===3) && (
                            <>
                                <div>
                                    <Label htmlFor="dob">Date Of Birth</Label>
                                    <Input
                                        id="dob"
                                        type="date"
                                        value={formState.dob || ""}
                                        onChange={(e) => setField("dob", e.target.value)}
                                    />
                                </div>
                                {/* Nationality*/}
                                <div>
                                    <Label htmlFor="nationality_id">Nationality</Label>
                                    <Select
                                        name="nationality_id"
                                        value={formState.nationality_id?.id?.toString() || ""}
                                        onValueChange={(value) =>
                                            setField("nationality_id", nationalities.find((nationality) => nationality.id.toString() === value))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select nationality" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {nationalities.map((nationality) => (
                                                <SelectItem key={nationality.id} value={nationality.id.toString()}>
                                                    {nationality.eng}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                {/* Race */}
                                <div>
                                    <Label htmlFor="race_id">Race</Label>
                                    <Select
                                        name="race_id"
                                        value={formState.race_id?.id?.toString() || ""}
                                        onValueChange={(value) =>
                                            setField("race_id", races.find((race) => race.id.toString() === value))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select race" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {races.map((race) => (
                                                <SelectItem key={race.id} value={race.id.toString()}>
                                                    {race.eng}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="ethnic_id">Ethnic</Label>
                                    <Select
                                        name="ethnic_id"
                                        value={formState.ethnic_id?.id?.toString() || ""}
                                        onValueChange={(value) =>
                                            setField("ethnic_id", ethnics.find((ethnic) => ethnic.id.toString() === value))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select ethnic" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ethnics.map((ethnic) => (
                                                <SelectItem key={ethnic.id} value={ethnic.id.toString()}>
                                                    {ethnic.eng}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="oku_status">OKU Status</Label>
                                    <RadioGroup
                                        value={formState.oku_status?.toString() ?? "null"} // Map value to string
                                        onValueChange={(value) =>
                                            setField("oku_status", value === "true" ? true : value === "false" ? false : null)
                                        }
                                    >
                                        <div className="flex items-center space-x-4 mt-3">
                                            <RadioGroupItem value="true" id="oku_yes" />
                                            <Label htmlFor="oku_yes">Yes</Label>
                                            <RadioGroupItem value="false" id="oku_no" />
                                            <Label htmlFor="oku_no">No</Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                            </>
                        )}
                        {(userType === "super_admin" || userGroup === 7 || userGroup ===9 || userGroup ===3) && (
                            <>
                                <div>
                                    <Label htmlFor="occupation_id">Occupation</Label>
                                    <Select
                                        name="occupation_id"
                                        value={formState.occupation_id?.id?.toString() || ""}
                                        onValueChange={(value) =>
                                            setField("occupation_id", occupations.find((occupation) => occupation.id.toString() === value))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select occupation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {occupations.map((occupation) => (
                                                <SelectItem key={occupation.id} value={occupation.id.toString()}>
                                                    {occupation.eng}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="type_sector">Sector</Label>
                                    <Select
                                        name="type_sector"
                                        value={formState.type_sector?.id?.toString() || ""}
                                        onValueChange={(value) =>
                                            setField("type_sector", typeSectors.find((sector) => sector.id.toString() === value))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select sector" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {typeSectors.map((sector) => (
                                                <SelectItem key={sector.id} value={sector.id.toString()}>
                                                    {sector.eng}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="ict_knowledge">ICT Knowledge</Label>
                                    <Select
                                        name="ict_knowledge"
                                        value={formState.ict_knowledge?.id?.toString() || ""}
                                        onValueChange={(value) =>
                                            setField("ict_knowledge", ictKnowledge.find((ict) => ict.id.toString() === value))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select ICT knowledge" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ictKnowledge.map((ict) => (
                                                <SelectItem key={ict.id} value={ict.id.toString()}>
                                                    {ict.eng}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="education_level">Education Level</Label>
                                    <Select
                                        name="education_level"
                                        value={formState.education_level?.id?.toString() || ""}
                                        onValueChange={(value) =>
                                            setField("education_level", educationLevels.find((education) => education.id.toString() === value))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Education level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {educationLevels.map((education) => (
                                                <SelectItem key={education.id} value={education.id.toString()}>
                                                    {education.eng}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}
                        {(userType === "super_admin" || userGroup ===9 || userGroup ===3) && (
                            <>
                                <div>
                                    <Label htmlFor="join_date">Join Date</Label>
                                    <Input
                                        id="join_date"
                                        type="date"
                                        value={formState.join_date || ""}
                                        onChange={(e) => setField("join_date", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="status_membership">Membership Status</Label>
                                    <RadioGroup
                                        value={formState.status_membership?.id?.toString() || ""} // Map the current status_membership.id to a string
                                        onValueChange={(value) =>
                                            setField(
                                                "status_membership",
                                                statusMemberships.find((status) => status.id.toString() === value) // Update formState with the selected status object
                                            )
                                        }
                                    >
                                        <div className="flex items-center space-x-4 mt-3">
                                            {statusMemberships.map((status) => (
                                                <div key={status.id} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={status.id.toString()} id={`status-${status.id}`} />
                                                    <Label htmlFor={`status-${status.id}`}>{status.name}</Label> {/* Display status.id as the label */}
                                                </div>
                                            ))}
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div>
                                    <Label htmlFor="status_entrepreneur">Entrepreneur Status</Label>
                                    <RadioGroup
                                        value={formState.status_entrepreneur?.toString() ?? "null"} // Map value to string
                                        onValueChange={(value) =>
                                            setField("status_entrepreneur", value === "true" ? true : value === "false" ? false : null)
                                        }
                                    >
                                        <div className="flex items-center space-x-4 mt-3">
                                            <RadioGroupItem value="true" id="status_entrepreneur_yes" />
                                            <Label htmlFor="status_entrepreneur_yes">Yes</Label>
                                            <RadioGroupItem value="false" id="status_entrepreneur_no" />
                                            <Label htmlFor="status_entrepreneur_no">No</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                                <div>
                                    <Label htmlFor="community_status">MADANI Community Status</Label>
                                    <RadioGroup
                                        value={formState.community_status?.toString() ?? "null"} // Map value to string
                                        onValueChange={(value) =>
                                            setField("community_status", value === "true" ? true : value === "false" ? false : null)
                                        }
                                    >
                                        <div className="flex items-center space-x-4 mt-3">
                                            <RadioGroupItem value="true" id="community_status_yes" />
                                            <Label htmlFor="community_status_yes">Yes</Label>
                                            <RadioGroupItem value="false" id="community_status_no" />
                                            <Label htmlFor="community_statusr_no">No</Label>
                                        </div>
                                    </RadioGroup>
                                </div>
                            </>
                        )}
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit">Save</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ProfileEditDialogMember;