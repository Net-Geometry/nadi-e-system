
import { useState, useEffect } from "react";

export const useUserMetadata = () => {
  const [userMetadata, setUserMetadata] = useState<any>(null);

  useEffect(() => {
    const storedValue = localStorage.getItem("user_metadata");
    
    if (storedValue) {
      try {
        const parsedMetadata = JSON.parse(storedValue);
        console.log("Retrieved user metadata from localStorage:", parsedMetadata);
        setUserMetadata(parsedMetadata);
      } catch (error) {
        console.error("Error parsing user metadata from localStorage:", error);
        setUserMetadata(null);
      }
    } else {
      console.log("No user metadata found in localStorage");
      setUserMetadata(null);
    }
  }, []);

  return userMetadata;
};
