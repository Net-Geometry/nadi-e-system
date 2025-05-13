import { supabase } from "@/integrations/supabase/client";
import { useSessionTracking } from "@/hooks/use-session-tracking";
import { useAuth } from "@/hooks/useAuth";

// Higher-order function to create tracked database operations
export const createTrackedOperation = (
  operation: "create" | "read" | "update" | "delete",
  tableName: string
) => {
  return () => {
    const { user } = useAuth();
    const { logDatabaseAction } = useSessionTracking(user);

    const executeOperation = async <T extends Record<string, any>>(
      query: any,
      recordId?: string
    ): Promise<{ data: T | null; error: Error | null }> => {
      const result = await query;

      if (user && !result.error) {
        // Determine the entity ID - either the provided one, the ID from the result, or 'batch'
        const entityId =
          recordId ||
          (result.data && "id" in result.data ? result.data.id : "batch");

        logDatabaseAction(operation, tableName, entityId, {
          affected_records: Array.isArray(result.data) ? result.data.length : 1,
          operation_details: operation === "create" ? "insert" : operation,
        });
      }

      return result;
    };

    // Database operation methods
    return {
      select: async <T extends Record<string, any>>(
        callback: (query: ReturnType<typeof supabase.from>) => any
      ) => {
        const query = callback(supabase.from(tableName));
        return executeOperation<T>(query);
      },

      insert: async <T extends Record<string, any>>(
        data: Partial<T> | Partial<T>[]
      ) => {
        const query = supabase.from(tableName).insert(data).select();
        return executeOperation<T>(query);
      },

      update: async <T extends Record<string, any>>(
        data: Partial<T>,
        recordId: string
      ) => {
        const query = supabase
          .from(tableName)
          .update(data)
          .eq("id", recordId)
          .select();
        return executeOperation<T>(query, recordId);
      },

      delete: async <T extends Record<string, any>>(recordId: string) => {
        const query = supabase
          .from(tableName)
          .delete()
          .eq("id", recordId)
          .select();
        return executeOperation<T>(query, recordId);
      },
    };
  };
};

// Example usage:
// const useUsersTable = createTrackedOperation('read', 'users');
// const { select, insert, update, delete: remove } = useUsersTable();
// const result = await select(query => query.eq('id', userId));
