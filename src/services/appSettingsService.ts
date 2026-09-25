import { supabase } from "@/lib/supabase";

const HACKED_MODE_KEY = "hacked_mode";

/**
 * Reads the hacked_mode setting from the app_settings table.
 * Returns false on any error (graceful degradation — guests should never see an error
 * just because this optional Easter egg feature failed to load).
 */
export const getHackedMode = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", HACKED_MODE_KEY)
      .single();

    if (error) return false;
    return data?.value === "true";
  } catch {
    return false;
  }
};

/**
 * Persists the hacked_mode setting to the app_settings table.
 * Throws on error so the caller can handle it (show toast, revert optimistic update).
 */
export const setHackedMode = async (value: boolean): Promise<void> => {
  const { error } = await supabase
    .from("app_settings")
    .update({ value: String(value), updated_at: new Date().toISOString() })
    .eq("key", HACKED_MODE_KEY);

  if (error) {
    console.error("Failed to persist hacked mode setting:", error);
    throw new Error(error.message || "Failed to save setting");
  }
};
