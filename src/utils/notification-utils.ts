import { supabase } from "@/integrations/supabase/client";
import { NotificationType } from "@/types/auth";

/**
 * Sends an in-app notification to a single user
 */
export async function sendNotificationToUser(
  userId: string,
  title: string,
  message: string,
  type: NotificationType = "info"
) {
  try {
    const { data, error } = await supabase.rpc("create_notification", {
      p_user_id: userId,
      p_title: title,
      p_message: message,
      p_type: type,
    });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error };
  }
}

/**
 * Sends an in-app notification to multiple users
 */
export async function sendNotificationToUsers(
  userIds: string[],
  title: string,
  message: string,
  type: NotificationType = "info"
) {
  const results = [];
  const errors = [];

  // Process notifications in batches to avoid overwhelming the database
  const batchSize = 50;
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);

    const promises = batch.map((userId) =>
      sendNotificationToUser(userId, title, message, type)
        .then((result) => {
          results.push({ userId, success: true });
          return result;
        })
        .catch((error) => {
          errors.push({ userId, error });
          return { success: false, error };
        })
    );

    await Promise.all(promises);
  }

  return {
    success: errors.length === 0,
    results,
    errors,
    totalSent: results.length,
    totalFailed: errors.length,
  };
}

/**
 * Sends a notification using a template to a single user
 */
export async function sendTemplateNotificationToUser(
  userId: string,
  templateId: string,
  params: Record<string, string> = {}
) {
  try {
    // First get the template
    const { data: template, error: templateError } = await supabase
      .from("notification_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (templateError) throw templateError;

    // Process template with params
    let title = template.title_template;
    let message = template.message_template;
    let type = template.type || "info";

    // Replace placeholders with provided params
    if (params) {
      Object.keys(params).forEach((key) => {
        const placeholder = `{${key}}`;
        title = title.replace(new RegExp(placeholder, "g"), params[key]);
        message = message.replace(new RegExp(placeholder, "g"), params[key]);
      });
    }

    // Send the notification
    return await sendNotificationToUser(
      userId,
      title,
      message,
      type as NotificationType
    );
  } catch (error) {
    console.error("Error sending template notification:", error);
    return { success: false, error };
  }
}

/**
 * Sends a notification using a template to multiple users
 */
export async function sendTemplateNotificationToUsers(
  userIds: string[],
  templateId: string,
  params: Record<string, string> = {}
) {
  try {
    // First get the template
    const { data: template, error: templateError } = await supabase
      .from("notification_templates")
      .select("*")
      .eq("id", templateId)
      .single();

    if (templateError) throw templateError;

    // Process template with params
    let title = template.title_template;
    let message = template.message_template;
    let type = template.type || "info";

    // Replace placeholders with provided params
    if (params) {
      Object.keys(params).forEach((key) => {
        const placeholder = `{${key}}`;
        title = title.replace(new RegExp(placeholder, "g"), params[key]);
        message = message.replace(new RegExp(placeholder, "g"), params[key]);
      });
    }

    // Send the notification to all users
    return await sendNotificationToUsers(
      userIds,
      title,
      message,
      type as NotificationType
    );
  } catch (error) {
    console.error("Error sending template notification:", error);
    return { success: false, error, totalSent: 0, totalFailed: userIds.length };
  }
}

/**
 * Sends a test email notification using a template
 */
export async function sendTestEmailWithTemplate(
  email: string,
  templateId: string,
  params: Record<string, string> = {}
) {
  try {
    const { error } = await supabase.functions.invoke("send-test-email", {
      body: {
        email,
        template_id: templateId,
        params,
      },
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error sending test email with template:", error);
    return { success: false, error };
  }
}

/**
 * Sends a test push notification using a template
 */
export async function sendTestPushWithTemplate(
  userId: string,
  templateId: string,
  params: Record<string, string> = {}
) {
  try {
    const { error } = await supabase.functions.invoke("send-test-push", {
      body: {
        userId,
        template_id: templateId,
        params,
      },
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error("Error sending test push with template:", error);
    return { success: false, error };
  }
}
