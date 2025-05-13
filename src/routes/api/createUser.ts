// This file will help with routing the API request to the Supabase function

import { supabase } from "@/integrations/supabase/client";
import { SUPABASE_URL } from "@/integrations/supabase/client";

export async function createUser(requestData: any) {
  // Use the imported SUPABASE_URL constant instead of accessing the protected property
  const supabaseUrl = SUPABASE_URL;

  // Construct the function URL
  const functionUrl = `${supabaseUrl}/functions/v1/create-user`;

  // Get auth token for authorization
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error("Authentication required");
  }

  // Call the Supabase function
  const response = await fetch(functionUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    let errorMessage = "Failed to create user";
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorMessage;
    } catch (jsonError) {
      errorMessage = `${errorMessage}: ${response.status} ${response.statusText}`;
    }
    throw new Error(errorMessage);
  }

  return await response.json();
}
