import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import TimeInput from "@/components/ui/TimePicker";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";

interface OperationTime {
  day: string;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  id?: number;
}

interface SiteOperationHoursProps {
  siteId?: string | null;
  onOperationTimesChange?: (operationTimes: OperationTime[]) => void;
  initialTimes?: OperationTime[]; // Add this prop to initialize from parent component
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const DEFAULT_OPEN_TIME = "08:00";
const DEFAULT_CLOSE_TIME = "18:00";

export const SiteOperationHours = ({
  siteId,
  onOperationTimesChange,
  initialTimes,
}: SiteOperationHoursProps) => {
  // Initialize with initialTimes if available, but keep a reference to the original initialTimes
  const [operationTimes, setOperationTimes] = useState<OperationTime[]>(
    initialTimes || []
  );
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false); // Track initialization state

  // Initialize operation hours - either from existing site or empty
  useEffect(() => {
    const initializeOperationTimes = async () => {
      if (hasInitialized) return; // Prevent reinitialization
      setIsLoading(true);

      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log("Operation hours loading timed out");
        setIsLoading(false);
        setOperationTimes(initialTimes || []);
        setHasInitialized(true); // Mark as initialized even on timeout
      }, 5000); // 5 second timeout

      if (siteId) {
        // If we're editing an existing site, fetch its operation times
        try {
          const { data, error } = await supabase
            .from("nd_site_operation")
            .select("*")
            .eq("site_id", siteId);

          clearTimeout(timeoutId); // Clear timeout on successful response

          if (error) throw error;

          if (data && data.length > 0) {
            // Map the database data to our OperationTime format
            const mappedData: OperationTime[] = data
              .map((item) => ({
                id: item.id,
                day: item.days_of_week,
                openTime: item.open_time
                  ? item.open_time.substring(0, 5)
                  : DEFAULT_OPEN_TIME,
                closeTime: item.close_time
                  ? item.close_time.substring(0, 5)
                  : DEFAULT_CLOSE_TIME,
                isClosed: item.is_closed || false,
              }))
              .sort(
                (a, b) =>
                  DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day)
              );

            setOperationTimes(mappedData);
          } else {
            // No existing operation times, initialize with empty array
            setOperationTimes(initialTimes || []);
          }
        } catch (error) {
          console.error("Error fetching operation times:", error);
          setOperationTimes(initialTimes || []);
        }
      } else if (initialTimes && initialTimes.length > 0) {
        clearTimeout(timeoutId);
        // Initialize from initialTimes prop
        setOperationTimes(initialTimes);
      } else {
        clearTimeout(timeoutId);
        // New site, initialize with empty array
        setOperationTimes([]);
      }

      setIsLoading(false);
      setHasInitialized(true); // Mark as initialized
    };

    initializeOperationTimes();
  }, [siteId, initialTimes, hasInitialized]);

  // Add effect to handle changes to initialTimes from parent
  useEffect(() => {
    // If we have initialTimes and they're different from current operation times, update
    if (initialTimes && initialTimes.length > 0) {
      // Only update if we have different values
      if (JSON.stringify(initialTimes) !== JSON.stringify(operationTimes)) {
        setOperationTimes(initialTimes);
      }
    }
  }, [initialTimes]);

  // Reset initialization state when siteId changes
  useEffect(() => {
    if (siteId) {
      setHasInitialized(false);
    }
  }, [siteId]);

  // Notify parent of changes
  useEffect(() => {
    if (onOperationTimesChange) {
      onOperationTimesChange(operationTimes);
    }
  }, [operationTimes, onOperationTimesChange]);

  // Create default operation times for all days
  const createDefaultOperationTimes = () => {
    const defaultTimes: OperationTime[] = DAYS_OF_WEEK.map((day) => ({
      day,
      openTime: DEFAULT_OPEN_TIME,
      closeTime: DEFAULT_CLOSE_TIME,
      isClosed: false,
    }));

    setOperationTimes(defaultTimes);
  };

  // Add a single day operation time
  const addOperationTime = (day: string) => {
    // Check if day already exists
    if (operationTimes.some((time) => time.day === day)) {
      return;
    }

    setOperationTimes((prev) =>
      [
        ...prev,
        {
          day,
          openTime: DEFAULT_OPEN_TIME,
          closeTime: DEFAULT_CLOSE_TIME,
          isClosed: false,
        },
      ].sort(
        (a, b) => DAYS_OF_WEEK.indexOf(a.day) - DAYS_OF_WEEK.indexOf(b.day)
      )
    );
  };

  // Remove a single day operation time
  const removeOperationTime = (day: string) => {
    setOperationTimes((prev) => prev.filter((time) => time.day !== day));
  };

  // Clear all operation times
  const clearAllOperationTimes = () => {
    setOperationTimes([]);
  };

  const handleOpenTimeChange = (day: string, time: string) => {
    setOperationTimes((prev) =>
      prev.map((item) =>
        item.day === day ? { ...item, openTime: time } : item
      )
    );
  };

  const handleCloseTimeChange = (day: string, time: string) => {
    setOperationTimes((prev) =>
      prev.map((item) =>
        item.day === day ? { ...item, closeTime: time } : item
      )
    );
  };

  const handleOpenToggle = (day: string, isOpen: boolean) => {
    setOperationTimes((prev) =>
      prev.map((item) =>
        item.day === day ? { ...item, isClosed: !isOpen } : item
      )
    );
  };

  // Generate available days that aren't already in the operation times
  const getAvailableDays = () => {
    const usedDays = operationTimes.map((time) => time.day);
    return DAYS_OF_WEEK.filter((day) => !usedDays.includes(day));
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Operation Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-8 space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            <p className="text-sm text-muted-foreground">
              Loading operation hours...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Operation Hours</CardTitle>
        <div className="flex space-x-2">
          {operationTimes.length > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllOperationTimes}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          ) : (
            <Button onClick={createDefaultOperationTimes} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add All Days
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {operationTimes.length === 0 ? (
          <div className="text-center p-6 border border-dashed rounded-md">
            <p className="text-gray-500 mb-4">No operation hours set.</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {DAYS_OF_WEEK.map((day) => (
                <Button
                  key={day}
                  variant="outline"
                  size="sm"
                  onClick={() => addOperationTime(day)}
                >
                  {day}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
              {operationTimes.map((item) => (
                <div
                  key={item.day}
                  className="flex flex-col space-y-2 p-3 border rounded-md relative"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.day}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 absolute top-1 right-1"
                      onClick={() => removeOperationTime(item.day)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor={`open-switch-${item.day}`}
                      className="text-sm"
                    >
                      Open
                    </Label>
                    <Switch
                      id={`open-switch-${item.day}`}
                      checked={!item.isClosed} // Invert the logic - Switch ON means NOT closed
                      onCheckedChange={(isOpen) =>
                        handleOpenToggle(item.day, isOpen)
                      }
                    />
                  </div>

                  {!item.isClosed && (
                    <>
                      <div className="space-y-1">
                        <Label htmlFor={`open-${item.day}`} className="text-sm">
                          Open Time
                        </Label>
                        <TimeInput
                          id={`open-${item.day}`}
                          value={item.openTime}
                          onChange={(value) =>
                            handleOpenTimeChange(item.day, value)
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <Label
                          htmlFor={`close-${item.day}`}
                          className="text-sm"
                        >
                          Close Time
                        </Label>
                        <TimeInput
                          id={`close-${item.day}`}
                          value={item.closeTime}
                          onChange={(value) =>
                            handleCloseTimeChange(item.day, value)
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {getAvailableDays().length > 0 && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Add more days:</div>
                <div className="flex flex-wrap gap-2">
                  {getAvailableDays().map((day) => (
                    <Button
                      key={day}
                      variant="outline"
                      size="sm"
                      onClick={() => addOperationTime(day)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {day}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SiteOperationHours;
