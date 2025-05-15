import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { menuGroups } from "@/utils/menu-groups";
import { UserType } from "@/types/auth";
import { useVisibilityData } from "./hooks/useVisibilityData";
import { VisibilityControls } from "./components/VisibilityControls";

export const MenuVisibilitySettings = () => {
  const { toast } = useToast();
  const {
    menuVisibility,
    submoduleVisibility,
    userTypes,
    isLoading,
    setMenuVisibility,
    setSubmoduleVisibility,
  } = useVisibilityData();

  const handleUpdateMenuVisibility = async (
    menuKey: string,
    userType: UserType,
    checked: boolean
  ) => {
    const existingMenu = menuVisibility.find((m) => m.menu_key === menuKey);

    let updatedVisibleTo = [];

    if (existingMenu) {
      updatedVisibleTo = checked
        ? [...new Set([...existingMenu.visible_to, userType])]
        : existingMenu.visible_to.filter((t) => t !== userType);
    } else {
      if (checked) {
        updatedVisibleTo = [userType];
      } else {
        return;
      }
    }

    try {
      const { data: existingData, error: lookupError } = await supabase
        .from("menu_visibility")
        .select("*")
        .eq("menu_key", menuKey)
        .maybeSingle();

      if (lookupError) throw lookupError;

      let saveError;

      if (existingData) {
        const { error } = await supabase
          .from("menu_visibility")
          .update({ visible_to: updatedVisibleTo })
          .eq("menu_key", menuKey);
        saveError = error;
      } else {
        const { error } = await supabase
          .from("menu_visibility")
          .insert({ menu_key: menuKey, visible_to: updatedVisibleTo });
        saveError = error;
      }

      if (saveError) throw saveError;

      setMenuVisibility((prev) => {
        if (prev.some((m) => m.menu_key === menuKey)) {
          return prev.map((m) =>
            m.menu_key === menuKey ? { ...m, visible_to: updatedVisibleTo } : m
          );
        }
        return [
          ...prev,
          {
            menu_key: menuKey,
            visible_to: updatedVisibleTo,
            menu_path: "", // Add required menu_path property
          },
        ];
      });

      toast({
        title: "Success",
        description: "Menu visibility updated successfully",
      });
    } catch (error) {
      console.error("Error updating menu visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update menu visibility",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSubmoduleVisibility = async (
    parentModule: string,
    submoduleKey: string,
    userType: UserType,
    checked: boolean
  ) => {
    const existingSubmodule = submoduleVisibility.find(
      (s) =>
        s.parent_module === parentModule && s.submodule_key === submoduleKey
    );

    let updatedVisibleTo = [];

    if (existingSubmodule) {
      updatedVisibleTo = checked
        ? [...new Set([...existingSubmodule.visible_to, userType])]
        : existingSubmodule.visible_to.filter((t) => t !== userType);
    } else {
      if (checked) {
        updatedVisibleTo = [userType];
      } else {
        return;
      }
    }

    try {
      const { data: existingData, error: lookupError } = await supabase
        .from("submodule_visibility")
        .select("*")
        .eq("parent_module", parentModule)
        .eq("submodule_key", submoduleKey)
        .maybeSingle();

      if (lookupError) throw lookupError;

      let saveError;

      if (existingData) {
        const { error } = await supabase
          .from("submodule_visibility")
          .update({ visible_to: updatedVisibleTo })
          .eq("parent_module", parentModule)
          .eq("submodule_key", submoduleKey);
        saveError = error;
      } else {
        const { error } = await supabase.from("submodule_visibility").insert({
          parent_module: parentModule,
          submodule_key: submoduleKey,
          visible_to: updatedVisibleTo,
          submodule_path: "", // Add required submodule_path property
        });
        saveError = error;
      }

      if (saveError) throw saveError;

      setSubmoduleVisibility((prev) => {
        const existingIndex = prev.findIndex(
          (s) =>
            s.parent_module === parentModule && s.submodule_key === submoduleKey
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            visible_to: updatedVisibleTo,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              parent_module: parentModule,
              submodule_key: submoduleKey,
              visible_to: updatedVisibleTo,
              submodule_path: "", // Add required submodule_path property
            },
          ];
        }
      });

      toast({
        title: "Success",
        description: "Submodule visibility updated successfully",
      });
    } catch (error) {
      console.error("Error updating submodule visibility:", error);
      toast({
        title: "Error",
        description: "Failed to update submodule visibility",
        variant: "destructive",
      });
    }
  };

  if (isLoading || !userTypes.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p>Loading user types...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Accordion type="single" collapsible className="space-y-4">
          {menuGroups.map((group) => (
            <AccordionItem key={group.label} value={group.label}>
              <AccordionTrigger className="text- font-semibold">
                {group.label}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pl-4">
                  <VisibilityControls
                    label="Main Menu Visibility"
                    userTypes={userTypes}
                    visibilityList={menuVisibility.filter(
                      (m) => m.menu_key === group.label
                    )}
                    identifier={group.label}
                    onUpdateVisibility={(userType, checked) =>
                      handleUpdateMenuVisibility(group.label, userType, checked)
                    }
                  />

                  {group.items.map((item) => (
                    <div
                      key={item.title}
                      className="border-l-2 border-gray-200 pl-4"
                    >
                      <VisibilityControls
                        label={item.title}
                        userTypes={userTypes}
                        visibilityList={submoduleVisibility.filter(
                          (s) =>
                            s.parent_module === group.label &&
                            s.submodule_key === item.title
                        )}
                        identifier={`${group.label}-${item.title}`}
                        onUpdateVisibility={(userType, checked) =>
                          handleUpdateSubmoduleVisibility(
                            group.label,
                            item.title,
                            userType,
                            checked
                          )
                        }
                      />
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
};
