//FORM STILL NOT COMPLETE
// TODO DUSP_TP UST CLUSTER
//

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import {
  fetchSiteStatus,
  fetchPhase,
  fetchRegion,
  fetchDistrict,
  fetchParliament,
  fetchMukim,
  fetchState,
  fetchDun,
  fetchTechnology,
  fetchBandwidth,
  fetchBuildingType,
  fetchZone,
  fetchCategoryArea,
  fetchBuildingLevel,
  fetchSocioecomic,
  fetchSiteSpace,
  fetchOrganization,
  fetchAllStates,
  fetchAllDistricts,
  fetchAllMukims,
  fetchAllParliaments,
  fetchAllDuns,
} from "@/components/site/hook/site-utils";
import { Textarea } from "../ui/textarea";
import { DateInput } from "@/components/ui/date-input";
import { useUserMetadata } from "@/hooks/use-user-metadata";
import { SelectMany } from "@/components/ui/SelectMany";
import { SelectOne } from "@/components/ui/SelectOne";
import { Site } from "@/types/site";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import operationTimesData from "@/data/operation-times.json";
import { SiteOperationHours } from "@/components/site/SiteOperationHours";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { FileUpload } from "@/components/ui/file-upload";
import { useSiteImage } from "./hook/use-site-image";
import { SUPABASE_URL } from "@/integrations/supabase/client";

interface SiteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site?: Site | null; // Add optional site prop for editing
}

interface OperationTime {
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  id?: number;
}

// Validation error interface
interface ValidationErrors {
  code?: string;
  name?: string;
  coordinates?: string;
  email?: string;
  building_area?: string;
  status?: string;
  address?: string;
  city?: string;
  postCode?: string;
  state?: string;
  technology?: string;
  building_type?: string;
  phase?: string;
  dusp_tp_id?: string; // Add validation for DUSP TP ID
}

// Add site image related interfaces
interface SiteImage {
  id: number;
  site_profile_id: string | number;
  file_url: string;
  file_urls?: string[];
}

export const SiteFormDialog = ({
  open,
  onOpenChange,
  site,
}: SiteFormDialogProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [operationTimes, setOperationTimes] = useState<OperationTime[]>([]);
  const [activeTab, setActiveTab] = useState("basic-info");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  // Add state to store operation hours between tab changes
  const [savedOperationTimes, setSavedOperationTimes] = useState<
    OperationTime[]
  >([]);

  // Add state for site images
  const [siteImages, setSiteImages] = useState<SiteImage[]>([]);
  const [selectedImageFiles, setSelectedImageFiles] = useState<File[]>([]);
  const [existingImagePaths, setExistingImagePaths] = useState<string[]>([]);
  // Add state to track images marked for deletion
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [hasInitializedImages, setHasInitializedImages] = useState(false);
  const fileUploadRef = useRef<any>(null);

  // Use the site image hook
  const {
    fetchSiteImages,
    uploadSiteImages,
    deleteSiteImage,
    loading: imageLoading,
  } = useSiteImage();

  // Retrieve user metadata
  const userMetadata = useUserMetadata();
  const parsedMetadata = userMetadata ? JSON.parse(userMetadata) : null;
  const organizationId =
    parsedMetadata?.user_type !== "super_admin" &&
    parsedMetadata?.user_group_name === "TP" &&
    parsedMetadata?.organization_id
      ? parsedMetadata.organization_id
      : null;

  // Fetch site images when editing a site
  useEffect(() => {
    const loadSiteImages = async () => {
      if (site?.id && !hasInitializedImages) {
        console.log("Fetching images for site ID:", site.id);
        const images = await fetchSiteImages(site.id);
        console.log("Fetched site images:", images);
        setSiteImages(images);

        // For each image, extract all available URLs
        const allImagePaths = images.flatMap(
          (img) => img.file_urls || [img.file_url]
        );
        console.log("Setting image paths:", allImagePaths);
        setExistingImagePaths(allImagePaths);
        setHasInitializedImages(true); // Mark as initialized to prevent re-fetching
      }
    };

    if (open && site) {
      loadSiteImages();
    }

    // Reset the initialization flag when the dialog is closed
    if (!open) {
      setHasInitializedImages(false);
    }
  }, [site, open, fetchSiteImages, hasInitializedImages]);

  // Handle image selection
  const handleImagesChange = (files: File[]) => {
    setSelectedImageFiles(files);
  };

  // Handle existing images change (when user removes an image)
  const handleExistingImagesChange = (
    updatedImages: Array<{ url: string; name: string }>,
    supabaseUrl: string
  ) => {
    const updatedPaths = updatedImages.map((img) =>
      img.url.startsWith(supabaseUrl)
        ? img.url.substring(supabaseUrl.length)
        : img.url
    );

    // Find removed images
    const removedPaths = existingImagePaths.filter(
      (path) => !updatedPaths.includes(path)
    );

    // Instead of deleting immediately, mark them for deletion when form is submitted
    if (removedPaths.length > 0) {
      console.log("Images marked for deletion:", removedPaths);
      setImagesToDelete((prev) => [...prev, ...removedPaths]);
      // Update the visible image paths (but don't actually delete from database yet)
      setExistingImagePaths(updatedPaths);
    }
  };

  // Reset form and image states when dialog is closed
  useEffect(() => {
    if (!open) {
      resetForm();
      setActiveTab("basic-info");
      setSelectedImageFiles([]);

      // Only reset site images if we're not editing an existing site
      if (!site) {
        setSiteImages([]);
        setExistingImagePaths([]);
      }

      // Reset file upload component
      if (fileUploadRef.current && fileUploadRef.current.reset) {
        fileUploadRef.current.reset();
      }
    }
  }, [open]);

  // Format existing images for FileUpload component
  const formattedExistingImages = useMemo(() => {
    console.log("Formatting site images:", siteImages);

    if (!siteImages || siteImages.length === 0) {
      console.log("No site images to format");
      return null;
    }

    // Handle case where an image might have multiple URLs in file_urls array
    const allImages = siteImages.flatMap((image) => {
      console.log("Processing image:", image);

      if (image.file_urls && image.file_urls.length > 0) {
        // Return each URL in file_urls as a separate image entry
        return image.file_urls.map((url) => {
          const fileName = url.split("/").pop() || "Image";
          const fullUrl = url.startsWith("http")
            ? url
            : `${SUPABASE_URL}${url}`;
          console.log(`Creating image entry: ${fileName}, URL: ${fullUrl}`);
          return {
            url: fullUrl,
            name: fileName,
          };
        });
      } else if (image.file_url) {
        // Handle single file_url case
        const fileName = image.file_url.split("/").pop() || "Image";
        const fullUrl = image.file_url.startsWith("http")
          ? image.file_url
          : `${SUPABASE_URL}${image.file_url}`;
        console.log(
          `Creating single image entry: ${fileName}, URL: ${fullUrl}`
        );
        return [
          {
            url: fullUrl,
            name: fileName,
          },
        ];
      } else {
        console.log("Image has no URLs");
        return [];
      }
    });

    console.log("Formatted images:", allImages);
    return allImages.length > 0 ? allImages : null;
  }, [siteImages]);

  // Hooks must be called unconditionally
  const [formState, setFormState] = useState({
    code: "",
    name: "",
    phase: undefined,
    region: undefined,
    parliament: undefined,
    dun: undefined,
    mukim: undefined,
    email: "",
    website: "",
    longitude: "",
    latitude: "",
    status: undefined,
    address: "",
    address2: "",
    district: undefined,
    city: "",
    postCode: "",
    state: undefined,
    technology: undefined,
    bandwidth: undefined,
    building_type: undefined,
    building_area: "",
    building_rental: undefined,
    zone: undefined,
    category_area: undefined,
    building_level: undefined,
    oku: undefined,
    coordinates: "",
    operate_date: "", // Add operate_date field
    socio_economic: [], // Add socio_economic field
    space: [], // Add space field
    dusp_tp_id: undefined, // Add dusp_tp_id field
  });

  // Improved setField function to properly handle clearing dependent fields
  const setField = (field: string, value: any) => {
    setTouched((prev) => ({ ...prev, [field]: true }));

    if (field === "coordinates") {
      setFormState((prevState) => ({ ...prevState, coordinates: value }));
      if (value.trim() === "") {
        setFormState((prevState) => ({
          ...prevState,
          longitude: "",
          latitude: "",
        }));
      } else if (value.includes(",")) {
        const [longitude, latitude] = value
          .split(",")
          .map((coord) => coord.trim());
        setFormState((prevState) => ({ ...prevState, longitude, latitude }));
      }
    } else {
      // Simple field update without cascading clearing
      setFormState((prevState) => ({ ...prevState, [field]: value }));
    }

    // Clear validation error when field is updated
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Handler for operation times changes
  const handleOperationTimesChange = (times: OperationTime[]) => {
    setOperationTimes(times);
    setSavedOperationTimes(times); // Save operation times when they change
  };

  // Validation function
  const validateForm = () => {
    const newErrors: ValidationErrors = {};
    let firstInvalidField: string | null = null;

    // Required fields validation - Basic Information
    if (!formState.code.trim()) {
      newErrors.code = "Site code is required";
      firstInvalidField = firstInvalidField || "code";
    }

    if (!formState.name.trim()) {
      newErrors.name = "Site name is required";
      firstInvalidField = firstInvalidField || "name";
    }

    if (!formState.status) {
      newErrors.status = "Site status is required";
      firstInvalidField = firstInvalidField || "status";
    }

    if (!formState.phase) {
      newErrors.phase = "Site phase is required";
      firstInvalidField = firstInvalidField || "phase";
    }

    // DUSP TP ID validation for super admin users
    if (parsedMetadata?.user_type === "super_admin" && !formState.dusp_tp_id) {
      newErrors.dusp_tp_id = "Organization is required";
      firstInvalidField = firstInvalidField || "dusp_tp_id";
    }

    // Required fields validation - Location Information
    if (!formState.address?.trim()) {
      newErrors.address = "Address is required";
      firstInvalidField = firstInvalidField || "address";
    }

    if (!formState.city?.trim()) {
      newErrors.city = "City is required";
      firstInvalidField = firstInvalidField || "city";
    }

    if (!formState.postCode?.trim()) {
      newErrors.postCode = "Postcode is required";
      firstInvalidField = firstInvalidField || "postCode";
    }

    if (!formState.state) {
      newErrors.state = "State is required";
      firstInvalidField = firstInvalidField || "state";
    }

    // Format validation for coordinates
    if (formState.coordinates) {
      const coordinates = formState.coordinates
        .split(",")
        .map((coord) => coord.trim());
      if (
        coordinates.length !== 2 ||
        !coordinates[0] ||
        !coordinates[1] ||
        isNaN(Number(coordinates[0])) ||
        isNaN(Number(coordinates[1]))
      ) {
        newErrors.coordinates =
          'Invalid coordinates format. Use "longitude, latitude"';
        firstInvalidField = firstInvalidField || "coordinates";
      }
    }

    // Email format validation (if provided)
    if (
      formState.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)
    ) {
      newErrors.email = "Invalid email format";
      firstInvalidField = firstInvalidField || "email";
    }

    // Building info validation
    if (!formState.building_type) {
      newErrors.building_type = "Building type is required";
      firstInvalidField = firstInvalidField || "building_type";
    }

    // Building area should be numeric if provided
    if (formState.building_area && isNaN(Number(formState.building_area))) {
      newErrors.building_area = "Building area must be a number";
      firstInvalidField = firstInvalidField || "building_area";
    }

    // Connectivity validation
    if (!formState.technology) {
      newErrors.technology = "Internet technology is required";
      firstInvalidField = firstInvalidField || "technology";
    }

    setErrors(newErrors);

    // Return the first invalid field for focusing
    return { isValid: Object.keys(newErrors).length === 0, firstInvalidField };
  };

  // Handler for input blur to mark field as touched
  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  // Function to determine if an input should show error state
  const shouldShowError = (field: string) => {
    return touched[field] && errors[field];
  };

  // Fetch socio-economic options
  const { data: socioEconomicOptions = [], isLoading: isSocioEconomicLoading } =
    useQuery({
      queryKey: ["socio-economic"],
      queryFn: fetchSocioecomic,
    });

  // Fetch site space options
  const { data: siteSpaceOptions = [], isLoading: isSiteSpaceLoading } =
    useQuery({
      queryKey: ["site-space"],
      queryFn: fetchSiteSpace,
    });

  // Fetch organization options for super admin
  const { data: organizations = [], isLoading: isOrganizationsLoading } =
    useQuery({
      queryKey: ["organizations"],
      queryFn: fetchOrganization,
      enabled: parsedMetadata?.user_type === "super_admin", // Only fetch for super admin
    });

  // Fetching START lookup data
  const { data: siteStatus = [], isLoading: isStatusLoading } = useQuery({
    queryKey: ["site-status"],
    queryFn: () => fetchSiteStatus(),
  });
  const { data: sitePhase = [], isLoading: isPhaseLoading } = useQuery({
    queryKey: ["site-phase"],
    queryFn: () => fetchPhase(),
  });

  // Replace existing dependent location queries with independent queries
  const { data: siteState = [], isLoading: isStateLoading } = useQuery({
    queryKey: ["all-states"],
    queryFn: fetchAllStates,
  });

  const { data: siteDistrict = [], isLoading: isDistrictLoading } = useQuery({
    queryKey: ["all-districts"],
    queryFn: fetchAllDistricts,
  });

  const { data: siteParliament = [], isLoading: isParliamentLoading } =
    useQuery({
      queryKey: ["all-parliaments"],
      queryFn: fetchAllParliaments,
    });

  const { data: siteDun = [], isLoading: isDunLoading } = useQuery({
    queryKey: ["all-duns"],
    queryFn: fetchAllDuns,
  });

  const { data: siteMukim = [], isLoading: isMukimLoading } = useQuery({
    queryKey: ["all-mukims"],
    queryFn: fetchAllMukims,
  });

  const { data: siteRegion = [], isLoading: isRegionLoading } = useQuery({
    queryKey: ["site-region"],
    queryFn: fetchRegion,
  });

  // Keep the remaining lookup queries unchanged
  const { data: siteTechnology = [], isLoading: isTechnologyLoading } =
    useQuery({
      queryKey: ["site-technology"],
      queryFn: fetchTechnology,
    });
  const { data: siteBandwidth = [], isLoading: isBandwidthLoading } = useQuery({
    queryKey: ["site-bandwidth"],
    queryFn: fetchBandwidth,
  });
  const { data: siteBuildingType = [], isLoading: isBuildingTypeLoading } =
    useQuery({
      queryKey: ["site-BuidlingType"],
      queryFn: fetchBuildingType,
    });
  const { data: siteZone = [], isLoading: isZoneLoading } = useQuery({
    queryKey: ["site-Zone"],
    queryFn: fetchZone,
  });
  const { data: siteCategoryArea = [], isLoading: isCategoryAreaLoading } =
    useQuery({
      queryKey: ["site-CategoryArea"],
      queryFn: fetchCategoryArea,
    });
  const { data: siteBuildingLevel = [], isLoading: isBuildingLevelLoading } =
    useQuery({
      queryKey: ["site-BuildingLevel"],
      queryFn: fetchBuildingLevel,
    });
  // Fetching END lookup data

  // This effect initializes the form with site data when editing
  useEffect(() => {
    if (site && !isRegionLoading) {
      // Populate all form fields directly without cascading dependencies
      const siteData = {
        code: site.nd_site[0]?.standard_code || "",
        name: site.sitename || "",
        phase: site.phase_id ? String(site.phase_id) : undefined,
        region: site.region_id ? String(site.region_id) : undefined,
        parliament: site.nd_parliament?.id
          ? String(site.nd_parliament.id)
          : undefined,
        dun: site.nd_dun?.id ? String(site.nd_dun.id) : undefined,
        mukim: site.nd_mukim?.id ? String(site.nd_mukim.id) : undefined,
        email: site.email || "",
        website: site.website || "",
        longitude: site.longtitude || "",
        latitude: site.latitude || "",
        status: site.active_status ? String(site.active_status) : undefined,
        address: site.nd_site_address[0]?.address1 || "",
        address2: site.nd_site_address[0]?.address2 || "",
        city: site.nd_site_address[0]?.city || "",
        postCode: site.nd_site_address[0]?.postcode || "",
        district: site.nd_site_address[0]?.district_id
          ? String(site.nd_site_address[0].district_id)
          : undefined,
        state: site.nd_site_address[0]?.state_id
          ? String(site.nd_site_address[0]?.state_id)
          : undefined,
        technology: site.technology ? String(site.technology) : undefined,
        bandwidth: site.bandwidth ? String(site.bandwidth) : undefined,
        building_type: site.building_type_id
          ? String(site.building_type_id)
          : undefined,
        building_area: site.building_area_id
          ? String(site.building_area_id)
          : "",
        building_rental:
          site.building_rental_id !== undefined
            ? site.building_rental_id
            : undefined,
        zone: site.zone_id ? String(site.zone_id) : undefined,
        category_area: site.area_id ? String(site.area_id) : undefined,
        building_level: site.level_id ? String(site.level_id) : undefined,
        oku: site.oku_friendly !== undefined ? site.oku_friendly : undefined,
        coordinates:
          site.longtitude && site.latitude
            ? `${site.longtitude},${site.latitude}`
            : "",
        operate_date: site.operate_date ? site.operate_date.split("T")[0] : "",
        socio_economic:
          site.nd_site_socioeconomic?.map((s) => s.nd_socioeconomics.id) || [],
        space: site.nd_site_space?.map((s) => s.nd_space.id) || [],
        dusp_tp_id: site.dusp_tp_id ? String(site.dusp_tp_id) : undefined,
      };

      setFormState(siteData);
    }
  }, [site, isRegionLoading]);

  //preset on 2nd value of status
  useEffect(() => {
    if (
      open &&
      !site &&
      !formState.status &&
      siteStatus.length > 1 &&
      !isStatusLoading
    ) {
      setField("status", String(siteStatus[1].id)); // Set predefined status when the form is opened
    }
  }, [open, site, formState.status, siteStatus, isStatusLoading]);

  useEffect(() => {
    if (!open) {
      resetForm();
      setActiveTab("basic-info");
    }
  }, [open]);

  useEffect(() => {
    if (site) {
      // Populate operation times if they exist
      if (site.nd_site_operation && site.nd_site_operation.length > 0) {
        const operationTimes = site.nd_site_operation.map((op) => ({
          day: op.days_of_week,
          openTime: op.open_time || "",
          closeTime: op.close_time || "",
          isClosed: op.is_closed,
          id: op.id,
        }));
        setOperationTimes(operationTimes);
        setSavedOperationTimes(operationTimes); // Save operation times when editing
      }
    } else {
      resetForm();
    }
  }, [site]);

  const resetForm = () => {
    setFormState({
      code: "",
      name: "",
      phase: undefined,
      region: undefined,
      parliament: undefined,
      dun: undefined,
      mukim: undefined,
      email: "",
      website: "",
      longitude: "",
      latitude: "",
      status: undefined,
      address: "",
      address2: "",
      district: undefined,
      city: "",
      postCode: "",
      state: undefined,
      technology: undefined,
      bandwidth: undefined,
      building_type: undefined,
      building_area: "",
      building_rental: undefined,
      zone: undefined,
      category_area: undefined,
      building_level: undefined,
      oku: undefined,
      coordinates: "",
      operate_date: "", // Add operate_date field
      socio_economic: [], // Add socio_economic field
      space: [], // Add space field
      dusp_tp_id: undefined, // Add dusp_tp_id field
    });
    setOperationTimes([]);
    setSavedOperationTimes([]); // Reset saved operation times
    setErrors({});
    setTouched({});
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    if (value === "operation") {
      // Restore saved operation times when switching to operation tab
      setOperationTimes(savedOperationTimes);
    } else if (activeTab === "operation") {
      // Save current operation times when leaving operation tab
      setSavedOperationTimes(operationTimes);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Mark all fields as touched
    const allFields = Object.keys(formState).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {} as Record<string, boolean>);
    setTouched(allFields);

    // Validate form before submission
    const { isValid, firstInvalidField } = validateForm();
    if (!isValid) {
      // Focus on the first invalid field
      if (firstInvalidField) {
        setTimeout(() => {
          const invalidInput = document.getElementById(firstInvalidField);
          if (invalidInput) {
            invalidInput.focus();
          }
        }, 100); // Short timeout to ensure tab switch happens first
      }

      // Identify which tab has errors and switch to it
      if (
        errors.code ||
        errors.name ||
        errors.phase ||
        errors.status ||
        errors.email
      ) {
        setActiveTab("basic-info");
      } else if (
        errors.address ||
        errors.city ||
        errors.postCode ||
        errors.state ||
        errors.coordinates
      ) {
        setActiveTab("location");
      } else if (errors.building_type || errors.building_area) {
        setActiveTab("building");
      } else if (errors.technology) {
        setActiveTab("connectivity");
      }

      toast({
        title: "Validation Error",
        description: "Please correct the highlighted fields before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if the site code already exists (case-insensitive)
      const { data: existingSite, error: codeCheckError } = await supabase
        .from("nd_site")
        .select("id, site_profile_id")
        .ilike("standard_code", formState.code);

      if (codeCheckError) throw codeCheckError; // Ignore "No rows found" error

      if (
        existingSite &&
        existingSite.length > 0 &&
        (!site || existingSite[0].site_profile_id !== site.id)
      ) {
        const codeInput = document.getElementById("code");
        if (codeInput) {
          codeInput.focus();
        }
        throw new Error("Site code already exists");
      }

      // Check if coordinates are valid
      if (formState.coordinates) {
        const coordinates = formState.coordinates
          .split(",")
          .map((coord) => coord.trim());
        if (
          coordinates.length !== 2 ||
          !coordinates[0] ||
          !coordinates[1] ||
          isNaN(Number(coordinates[0])) ||
          isNaN(Number(coordinates[1]))
        ) {
          const coorInput = document.getElementById("coordinates");
          if (coorInput) {
            coorInput.focus();
          }
          throw new Error(
            'Invalid coordinate format. Please use "longitude, latitude" with valid numbers.'
          );
        }
      }

      const site_profile = {
        sitename: formState.name || "",
        fullname: "NADI" + (formState.name || ""),
        phase_id: formState.phase === "" ? null : formState.phase,
        region_id: formState.region === "" ? null : formState.region,
        parliament_rfid:
          formState.parliament === "" ? null : formState.parliament,
        dun_rfid: formState.dun === "" ? null : formState.dun,
        mukim_id: formState.mukim === "" ? null : formState.mukim,
        email: formState.email || "",
        website: formState.website || "",
        longtitude: formState.longitude
          ? parseFloat(formState.longitude)
          : null,
        latitude: formState.latitude ? parseFloat(formState.latitude) : null,
        state_id: formState.state === "" ? null : formState.state,
        active_status: formState.status === "" ? null : formState.status,
        technology: formState.technology === "" ? null : formState.technology,
        building_area_id: formState.building_area
          ? parseFloat(formState.building_area)
          : null,
        bandwidth: formState.bandwidth === "" ? null : formState.bandwidth,
        building_type_id:
          formState.building_type === "" ? null : formState.building_type,
        building_rental_id:
          formState.building_rental === undefined
            ? null
            : formState.building_rental,
        zone_id: formState.zone === "" ? null : formState.zone,
        area_id:
          formState.category_area === "" ? null : formState.category_area,
        level_id:
          formState.building_level === "" ? null : formState.building_level,
        oku_friendly: formState.oku ?? null,
        operate_date: formState.operate_date || null,
        dusp_tp_id: formState.dusp_tp_id === "" ? null : formState.dusp_tp_id, // Add dusp_tp_id to site_profile
        ...(site ? {} : organizationId ? { dusp_tp_id: organizationId } : {}), // Add dusp_tp_id only for creation and non-super_admin and TP group only
      };

      const site_address = {
        address1: formState.address || "",
        address2: formState.address2 || "",
        city: formState.city || "",
        postcode: formState.postCode || "",
        district_id: formState.district === "" ? null : formState.district,
        state_id: formState.state === "" ? null : formState.state,
        active_status: formState.status === "" ? null : formState.status,
      };

      const standard_code = formState.code;

      console.log(site_profile);
      console.log(site_address);

      let siteId: number;
      if (site) {
        // Update existing site (exclude dusp_tp_id from updates)
        const { error: profError } = await supabase
          .from("nd_site_profile")
          .update(site_profile)
          .eq("id", site.id);

        if (profError) throw profError;

        const { error: addressError } = await supabase
          .from("nd_site_address")
          .update(site_address)
          .eq("site_id", site.id);

        if (addressError) throw addressError;

        const { error: codeError } = await supabase
          .from("nd_site")
          .update({ standard_code })
          .eq("site_profile_id", site.id);

        if (codeError) throw codeError;

        // Update socio-economic data
        const { error: deleteSocioError } = await supabase
          .from("nd_site_socioeconomic")
          .delete()
          .eq("site_id", site.id);

        if (deleteSocioError) throw deleteSocioError;

        const socioEconomicData = formState.socio_economic.map((id) => ({
          site_id: site.id,
          socioeconomic_id: id,
        }));

        const { error: insertSocioError } = await supabase
          .from("nd_site_socioeconomic")
          .insert(socioEconomicData);

        if (insertSocioError) throw insertSocioError;

        // Update space data
        const { error: deleteSpaceError } = await supabase
          .from("nd_site_space")
          .delete()
          .eq("site_id", site.id);

        if (deleteSpaceError) throw deleteSpaceError;

        const spaceData = formState.space.map((id) => ({
          site_id: site.id,
          space_id: id,
        }));

        const { error: insertSpaceError } = await supabase
          .from("nd_site_space")
          .insert(spaceData);

        if (insertSpaceError) throw insertSpaceError;

        // Always delete existing operation hours regardless of whether the tab was visited
        const { error: deleteOpError } = await supabase
          .from("nd_site_operation")
          .delete()
          .eq("site_id", site.id);

        if (deleteOpError) throw deleteOpError;

        // Only add operation hours if there are any to add
        // This allows sites to have empty operation hours
        if (operationTimes.length > 0) {
          const operationRecords = operationTimes.map((op) => ({
            days_of_week: op.day,
            open_time: op.isClosed ? null : op.openTime,
            close_time: op.isClosed ? null : op.closeTime,
            is_closed: op.isClosed,
            site_id: site.id,
          }));

          const { error: operationError } = await supabase
            .from("nd_site_operation")
            .insert(operationRecords);

          if (operationError) throw operationError;
        }

        siteId = Number(site.id);

        // Process any images marked for deletion
        if (imagesToDelete.length > 0) {
          console.log("Processing images marked for deletion:", imagesToDelete);

          for (const path of imagesToDelete) {
            try {
              // Find which image record contains this path
              const imageRecord = siteImages.find(
                (img) =>
                  img.file_url === path ||
                  (img.file_urls && img.file_urls.includes(path))
              );

              if (imageRecord) {
                console.log("Deleting image:", path);
                await deleteSiteImage(imageRecord.id, path);
              }
            } catch (error) {
              console.error("Error deleting image:", error);
              // Don't throw error here, continue with the rest of the submission
            }
          }

          // Clear the images to delete array
          setImagesToDelete([]);
        }

        // Upload new site images if any
        if (selectedImageFiles.length > 0) {
          const result = await uploadSiteImages(
            siteId,
            selectedImageFiles,
            standard_code
          );
          if (!result.success) {
            console.error("Error uploading site images:", result.error);
            // Don't throw error here, continue with the rest of the submission
          }
        }

        toast({
          title: "Site updated successfully",
          description: `The ${site.sitename} site has been updated in the system.`,
        });
      } else {
        // Create new site
        const { data: profData, error: profError } = await supabase
          .from("nd_site_profile")
          .insert([site_profile])
          .select("id");

        if (profError) throw profError;

        if (!profData) throw new Error("Profile data is null");
        siteId = profData[0].id;

        const { error: addressError } = await supabase
          .from("nd_site_address")
          .insert([{ ...site_address, site_id: siteId }]);

        if (addressError) throw addressError;

        const { error: codeError } = await supabase
          .from("nd_site")
          .insert([{ standard_code: standard_code, site_profile_id: siteId }])
          .select("id");

        if (codeError) throw codeError;

        // Create socio-economic data
        const socioEconomicData = formState.socio_economic.map((id) => ({
          site_id: siteId,
          socioeconomic_id: id,
        }));

        const { error: insertSocioError } = await supabase
          .from("nd_site_socioeconomic")
          .insert(socioEconomicData);

        if (insertSocioError) throw insertSocioError;

        // Create space data
        const spaceData = formState.space.map((id) => ({
          site_id: siteId,
          space_id: id,
        }));

        const { error: insertSpaceError } = await supabase
          .from("nd_site_space")
          .insert(spaceData);

        if (insertSpaceError) throw insertSpaceError;

        // Only insert operation times if there are any to add
        // This allows new sites to have empty operation hours too
        if (operationTimes.length > 0) {
          const operationRecords = operationTimes.map((op) => ({
            days_of_week: op.day,
            open_time: op.isClosed ? null : op.openTime,
            close_time: op.isClosed ? null : op.closeTime,
            is_closed: op.isClosed,
            site_id: siteId,
          }));

          const { error: operationError } = await supabase
            .from("nd_site_operation")
            .insert(operationRecords);

          if (operationError) throw operationError;
        }

        // Upload new site images if any
        if (selectedImageFiles.length > 0) {
          const result = await uploadSiteImages(
            siteId,
            selectedImageFiles,
            standard_code
          );
          if (!result.success) {
            console.error("Error uploading site images:", result.error);
            // Don't throw error here, continue with the rest of the submission
          }
        }

        toast({
          title: "Site added successfully",
          description: `The ${site_profile.sitename} site has been added to the system.`,
        });
      }

      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ["site-stats"] });
      queryClient.invalidateQueries({ queryKey: ["sites"] });

      resetForm();
      setSelectedImageFiles([]);
    } catch (error) {
      console.error("Error adding/updating site:", error);
      toast({
        title: "Error",
        description:
          error.message || "Failed to add/update the site. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Access control logic moved to the return statement
  if (parsedMetadata?.user_type !== "super_admin" && !organizationId) {
    return <div>You do not have access to create or edit sites.</div>;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {site ? "Edit Site" : "Add New Site"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-4 flex flex-wrap">
              <TabsTrigger
                value="basic-info"
                className={cn(
                  errors.code ||
                    errors.name ||
                    errors.phase ||
                    errors.status ||
                    errors.email
                    ? "text-red-500 font-medium"
                    : ""
                )}
              >
                Basic Info
              </TabsTrigger>
              <TabsTrigger
                value="location"
                className={cn(
                  errors.address ||
                    errors.city ||
                    errors.postCode ||
                    errors.state ||
                    errors.coordinates
                    ? "text-red-500 font-medium"
                    : ""
                )}
              >
                Location
              </TabsTrigger>
              <TabsTrigger
                value="building"
                className={cn(
                  errors.building_area || errors.building_type
                    ? "text-red-500 font-medium"
                    : ""
                )}
              >
                Building Info
              </TabsTrigger>
              <TabsTrigger
                value="connectivity"
                className={cn(
                  errors.technology ? "text-red-500 font-medium" : ""
                )}
              >
                Connectivity
              </TabsTrigger>
              <TabsTrigger value="facilities">Facilities</TabsTrigger>
              <TabsTrigger value="operation">Operation Hours</TabsTrigger>
              <TabsTrigger value="images">Site Images</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic-info" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <DialogTitle>Basic Information</DialogTitle>

                  {parsedMetadata?.user_type === "super_admin" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="dusp_tp_id"
                        className={
                          shouldShowError("dusp_tp_id") ? "text-red-500" : ""
                        }
                      >
                        Organization*
                      </Label>
                      <SelectOne
                        options={organizations.map((org) => ({
                          id: String(org.id),
                          label: org.displayName,
                        }))}
                        value={formState.dusp_tp_id}
                        onChange={(value) => {
                          setField("dusp_tp_id", value);
                          handleBlur("dusp_tp_id");
                        }}
                        placeholder="Select organization"
                        disabled={isOrganizationsLoading}
                        className={
                          shouldShowError("dusp_tp_id")
                            ? "border-red-500 focus-visible:ring-red-500"
                            : ""
                        }
                      />
                      {shouldShowError("dusp_tp_id") && (
                        <p className="text-sm text-red-500">
                          {errors.dusp_tp_id}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label
                      htmlFor="name"
                      className={shouldShowError("name") ? "text-red-500" : ""}
                    >
                      Site Name*
                    </Label>
                    <Input
                      id="name"
                      name="name"
                      value={formState.name}
                      onChange={(e) => setField("name", e.target.value)}
                      onBlur={() => handleBlur("name")}
                      className={
                        shouldShowError("name")
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                      required
                    />
                    {shouldShowError("name") && (
                      <p className="text-sm text-red-500">{errors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="code"
                      className={shouldShowError("code") ? "text-red-500" : ""}
                    >
                      Site Code*
                    </Label>
                    <Input
                      id="code"
                      name="code"
                      value={formState.code}
                      onChange={(e) => setField("code", e.target.value)}
                      onBlur={() => handleBlur("code")}
                      className={
                        shouldShowError("code")
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                      required
                    />
                    {shouldShowError("code") && (
                      <p className="text-sm text-red-500">{errors.code}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="phase"
                      className={shouldShowError("phase") ? "text-red-500" : ""}
                    >
                      Phase*
                    </Label>
                    <SelectOne
                      options={sitePhase.map((phase) => ({
                        id: String(phase.id),
                        label: phase.name,
                      }))}
                      value={formState.phase}
                      onChange={(value) => {
                        setField("phase", value);
                        handleBlur("phase");
                      }}
                      placeholder="Select phase"
                      disabled={isPhaseLoading}
                      className={
                        shouldShowError("phase")
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                    />
                    {shouldShowError("phase") && (
                      <p className="text-sm text-red-500">{errors.phase}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="status"
                      className={
                        shouldShowError("status") ? "text-red-500" : ""
                      }
                    >
                      Status*
                    </Label>
                    <SelectOne
                      options={siteStatus.map((status) => ({
                        id: String(status.id),
                        label: status.eng,
                      }))}
                      value={formState.status}
                      onChange={(value) => {
                        setField("status", value);
                        handleBlur("status");
                      }}
                      placeholder="Select status"
                      disabled={isStatusLoading}
                      className={
                        shouldShowError("status")
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                    />
                    {shouldShowError("status") && (
                      <p className="text-sm text-red-500">{errors.status}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="operate_date">Operate Date</Label>
                    <DateInput
                      id="operate_date"
                      name="operate_date"
                      value={formState.operate_date}
                      onChange={(e) => setField("operate_date", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <DialogTitle>Contact Information</DialogTitle>
                  <div className="space-y-2">
                    <Label
                      htmlFor="email"
                      className={shouldShowError("email") ? "text-red-500" : ""}
                    >
                      Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      value={formState.email}
                      type="email"
                      onChange={(e) => setField("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      className={
                        shouldShowError("email")
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                    />
                    {shouldShowError("email") && (
                      <p className="text-sm text-red-500">{errors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      value={formState.website}
                      onChange={(e) => setField("website", e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Location Tab */}
            <TabsContent value="location" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <DialogTitle>Address Information</DialogTitle>
                  <div className="space-y-2">
                    <Label
                      htmlFor="address"
                      className={
                        shouldShowError("address") ? "text-red-500" : ""
                      }
                    >
                      Address*
                    </Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formState.address}
                      onChange={(e) => setField("address", e.target.value)}
                      onBlur={() => handleBlur("address")}
                      className={
                        shouldShowError("address")
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                    />
                    {shouldShowError("address") && (
                      <p className="text-sm text-red-500">{errors.address}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address2">Address 2 (Optional)</Label>
                    <Textarea
                      id="address2"
                      name="address2"
                      value={formState.address2}
                      onChange={(e) => setField("address2", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="city"
                      className={shouldShowError("city") ? "text-red-500" : ""}
                    >
                      City*
                    </Label>
                    <Input
                      id="city"
                      name="city"
                      value={formState.city}
                      onChange={(e) => setField("city", e.target.value)}
                      onBlur={() => handleBlur("city")}
                      className={
                        shouldShowError("city")
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                    />
                    {shouldShowError("city") && (
                      <p className="text-sm text-red-500">{errors.city}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="postCode"
                      className={
                        shouldShowError("postCode") ? "text-red-500" : ""
                      }
                    >
                      Postcode*
                    </Label>
                    <Input
                      id="postCode"
                      name="postCode"
                      value={formState.postCode}
                      onChange={(e) => setField("postCode", e.target.value)}
                      onBlur={() => handleBlur("postCode")}
                      className={
                        shouldShowError("postCode")
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                    />
                    {shouldShowError("postCode") && (
                      <p className="text-sm text-red-500">{errors.postCode}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="coordinates"
                      className={
                        shouldShowError("coordinates") ? "text-red-500" : ""
                      }
                    >
                      Coordinates (Longitude, Latitude)
                    </Label>
                    <Input
                      id="coordinates"
                      name="coordinates"
                      placeholder="eg 3.2207, 101.439"
                      value={
                        formState.coordinates ??
                        (formState.longitude
                          ? formState.longitude +
                            (formState.latitude ? "," + formState.latitude : "")
                          : "")
                      }
                      onChange={(e) => setField("coordinates", e.target.value)}
                      onBlur={() => handleBlur("coordinates")}
                      className={
                        shouldShowError("coordinates")
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                    />
                    {shouldShowError("coordinates") && (
                      <p className="text-sm text-red-500">
                        {errors.coordinates}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <DialogTitle>Administrative Areas</DialogTitle>
                  <div className="space-y-2">
                    <Label htmlFor="region">Region</Label>
                    <SelectOne
                      options={siteRegion.map((region) => ({
                        id: String(region.id),
                        label: region.eng,
                      }))}
                      value={formState.region}
                      onChange={(value) => setField("region", value)}
                      placeholder="Select region"
                      disabled={isRegionLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="state"
                      className={shouldShowError("state") ? "text-red-500" : ""}
                    >
                      State*
                    </Label>
                    <SelectOne
                      options={siteState.map((state) => ({
                        id: String(state.id),
                        label: state.name,
                      }))}
                      value={formState.state}
                      onChange={(value) => {
                        setField("state", value);
                        handleBlur("state");
                      }}
                      placeholder="Select state"
                      disabled={isStateLoading}
                      className={
                        shouldShowError("state")
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                    />
                    {shouldShowError("state") && (
                      <p className="text-sm text-red-500">{errors.state}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="district">District</Label>
                    <SelectOne
                      options={siteDistrict.map((district) => ({
                        id: String(district.id),
                        label: district.name,
                      }))}
                      value={formState.district}
                      onChange={(value) => setField("district", value)}
                      placeholder="Select district"
                      disabled={isDistrictLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mukim">Mukim</Label>
                    <SelectOne
                      options={siteMukim.map((mukim) => ({
                        id: String(mukim.id),
                        label: mukim.name,
                      }))}
                      value={formState.mukim}
                      onChange={(value) => setField("mukim", value)}
                      placeholder="Select mukim"
                      disabled={isMukimLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parliament">Parliament</Label>
                    <SelectOne
                      options={siteParliament.map((parliament) => ({
                        id: String(parliament.id),
                        label: parliament.fullname,
                      }))}
                      value={formState.parliament}
                      onChange={(value) => setField("parliament", value)}
                      placeholder="Select parliament"
                      disabled={isParliamentLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dun">Dun</Label>
                    <SelectOne
                      options={siteDun.map((dun) => ({
                        id: String(dun.id),
                        label: dun.full_name,
                      }))}
                      value={formState.dun}
                      onChange={(value) => setField("dun", value)}
                      placeholder="Select dun"
                      disabled={isDunLoading}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Building Info Tab */}
            <TabsContent value="building" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <DialogTitle>Building Information</DialogTitle>
                  <div className="space-y-2">
                    <Label
                      htmlFor="building_type"
                      className={
                        shouldShowError("building_type") ? "text-red-500" : ""
                      }
                    >
                      Building Type*
                    </Label>
                    <SelectOne
                      options={siteBuildingType.map((type) => ({
                        id: String(type.id),
                        label: type.eng,
                      }))}
                      value={formState.building_type}
                      onChange={(value) => {
                        setField("building_type", value);
                        handleBlur("building_type");
                      }}
                      placeholder="Select building type"
                      disabled={isBuildingTypeLoading}
                      className={
                        shouldShowError("building_type")
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                    />
                    {shouldShowError("building_type") && (
                      <p className="text-sm text-red-500">
                        {errors.building_type}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="building_area"
                      className={
                        shouldShowError("building_area") ? "text-red-500" : ""
                      }
                    >
                      Building Area (sqft)
                    </Label>
                    <Input
                      id="building_area"
                      name="building_area"
                      type="number"
                      placeholder="0"
                      value={formState.building_area}
                      onChange={(e) =>
                        setField("building_area", e.target.value)
                      }
                      onBlur={() => handleBlur("building_area")}
                      className={
                        shouldShowError("building_area")
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                    />
                    {shouldShowError("building_area") && (
                      <p className="text-sm text-red-500">
                        {errors.building_area}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="building_level">Building Level</Label>
                    <SelectOne
                      options={siteBuildingLevel.map((level) => ({
                        id: String(level.id),
                        label: level.eng,
                      }))}
                      value={formState.building_level}
                      onChange={(value) => setField("building_level", value)}
                      placeholder="Select building level"
                      disabled={isBuildingLevelLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="building_rental">Building Rental</Label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="building_rental"
                          checked={formState.building_rental === true}
                          onChange={() => setField("building_rental", true)}
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="building_rental"
                          checked={formState.building_rental === false}
                          onChange={() => setField("building_rental", false)}
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <DialogTitle>Area Classification</DialogTitle>
                  <div className="space-y-2">
                    <Label htmlFor="zone">Zone</Label>
                    <SelectOne
                      options={siteZone.map((zone) => ({
                        id: String(zone.id),
                        label: zone.area,
                      }))}
                      value={formState.zone}
                      onChange={(value) => setField("zone", value)}
                      placeholder="Select zone"
                      disabled={isZoneLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="area">Category Area</Label>
                    <SelectOne
                      options={siteCategoryArea.map((catA) => ({
                        id: String(catA.id),
                        label: catA.name,
                      }))}
                      value={formState.category_area}
                      onChange={(value) => setField("category_area", value)}
                      placeholder="Select category area"
                      disabled={isCategoryAreaLoading}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Connectivity Tab */}
            <TabsContent value="connectivity" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <DialogTitle>Internet Connectivity</DialogTitle>
                  <div className="space-y-2">
                    <Label
                      htmlFor="technology"
                      className={
                        shouldShowError("technology") ? "text-red-500" : ""
                      }
                    >
                      Internet Technology*
                    </Label>
                    <SelectOne
                      options={siteTechnology.map((tech) => ({
                        id: String(tech.id),
                        label: tech.name,
                      }))}
                      value={formState.technology}
                      onChange={(value) => {
                        setField("technology", value);
                        handleBlur("technology");
                      }}
                      placeholder="Select technology"
                      disabled={isTechnologyLoading}
                      className={
                        shouldShowError("technology")
                          ? "border-red-500 focus-visible:ring-red-500"
                          : ""
                      }
                    />
                    {shouldShowError("technology") && (
                      <p className="text-sm text-red-500">
                        {errors.technology}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bandwidth">Internet Speed (Mbps)</Label>
                    <SelectOne
                      options={siteBandwidth.map((bandwidth) => ({
                        id: String(bandwidth.id),
                        label: bandwidth.name,
                      }))}
                      value={formState.bandwidth}
                      onChange={(value) => setField("bandwidth", value)}
                      placeholder="Select bandwidth"
                      disabled={isBandwidthLoading}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Facilities Tab */}
            <TabsContent value="facilities" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <DialogTitle>Accessibility & Features</DialogTitle>
                  <div className="space-y-2">
                    <Label htmlFor="oku">OKU Friendly</Label>
                    <div className="flex space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="oku"
                          checked={formState.oku === true}
                          onChange={() => setField("oku", true)}
                        />
                        <span>Yes</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="oku"
                          checked={formState.oku === false}
                          onChange={() => setField("oku", false)}
                        />
                        <span>No</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="socio_economic">Socio-Economic</Label>
                    <SelectMany
                      options={socioEconomicOptions.map((option) => ({
                        id: option.id,
                        label: option.eng,
                      }))}
                      value={formState.socio_economic}
                      onChange={(value) => setField("socio_economic", value)}
                      placeholder="Select socio-economic"
                      disabled={isSocioEconomicLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="space">Space</Label>
                    <SelectMany
                      options={siteSpaceOptions.map((option) => ({
                        id: option.id,
                        label: option.eng,
                      }))}
                      value={formState.space}
                      onChange={(value) => setField("space", value)}
                      placeholder="Select space"
                      disabled={isSiteSpaceLoading}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Operation Hours Tab */}
            <TabsContent value="operation">
              <SiteOperationHours
                siteId={site?.id}
                onOperationTimesChange={handleOperationTimesChange}
                initialTimes={savedOperationTimes}
              />
            </TabsContent>

            {/* Site Images Tab */}
            <TabsContent value="images" className="space-y-4">
              <DialogTitle>Site Images</DialogTitle>
              <div className="space-y-4">
                {imagesToDelete.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
                    <div className="flex items-center text-amber-700">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2"
                      >
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        <line x1="12" y1="9" x2="12" y2="13"></line>
                        <line x1="12" y1="17" x2="12.01" y2="17"></line>
                      </svg>
                      <span>
                        {imagesToDelete.length} image
                        {imagesToDelete.length > 1 ? "s" : ""} marked for
                        deletion. Click "Update Site" to apply these changes.
                      </span>
                    </div>
                  </div>
                )}
                <FileUpload
                  ref={fileUploadRef}
                  maxFiles={3}
                  acceptedFileTypes=".jpg,.jpeg,.png,.gif,.webp"
                  maxSizeInMB={5}
                  buttonText="Choose Images"
                  onFilesSelected={handleImagesChange}
                  multiple={true}
                  existingFiles={formattedExistingImages}
                  onExistingFilesChange={(files) =>
                    handleExistingImagesChange(files, SUPABASE_URL)
                  }
                >
                  Add Site Images
                </FileUpload>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload images of the site. Accepted formats: jpg, jpeg, png,
                  gif, webp. Max 5 images, each up to 5MB.
                </p>
                {/* <p className="text-sm text-amber-600">
                  <strong>Note:</strong> When you remove an image, it will be marked for deletion but only deleted when you click "Update Site".
                </p> */}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="ml-2">
              {isSubmitting ? "Saving..." : site ? "Update Site" : "Add Site"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SiteFormDialog;
