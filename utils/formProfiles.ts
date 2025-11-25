import { storage } from "wxt/storage";

export interface FormProfile {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  data: {
    // Personal Information
    firstName?: string;
    lastName?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    
    // Address Information
    address?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    
    // Professional Information
    company?: string;
    jobTitle?: string;
    workEmail?: string;
    workPhone?: string;
    
    // Additional Information
    website?: string;
    linkedin?: string;
    github?: string;
    twitter?: string;
    
    // Custom Fields
    customFields?: Record<string, string>;
  };
}

export interface FormProfilesStore {
  profiles: FormProfile[];
  activeProfileId?: string;
}

const FORM_PROFILES_KEY = "sync:samai_form_profiles";

export class FormProfilesManager {
  /**
   * Get all profiles with error handling
   */
  static async getProfiles(): Promise<FormProfile[]> {
    try {
      const data = await storage.getItem<FormProfilesStore>(FORM_PROFILES_KEY);
      if (!data || !Array.isArray(data.profiles)) {
        console.log("[SamAI] No profiles found or invalid format");
        return [];
      }
      return data.profiles;
    } catch (error) {
      console.error("[SamAI] Error getting form profiles:", error);
      // Try to initialize storage if it doesn't exist
      try {
        await storage.setItem(FORM_PROFILES_KEY, { profiles: [] });
      } catch (initError) {
        console.error("[SamAI] Error initializing profiles storage:", initError);
      }
      return [];
    }
  }

  /**
   * Get active profile with improved error handling
   */
  static async getActiveProfile(): Promise<FormProfile | null> {
    try {
      const data = await storage.getItem<FormProfilesStore>(FORM_PROFILES_KEY);
      if (!data?.activeProfileId || !Array.isArray(data.profiles)) {
        return null;
      }
      
      return data.profiles.find((p: FormProfile) => p.id === data.activeProfileId) || null;
    } catch (error) {
      console.error("[SamAI] Error getting active form profile:", error);
      return null;
    }
  }

  /**
   * Create a new profile with enhanced validation
   */
  static async createProfile(profile: Omit<FormProfile, "id" | "createdAt" | "updatedAt">): Promise<FormProfile> {
    try {
      // Validate profile data
      if (!profile.name || !profile.name.trim()) {
        throw new Error("Profile name is required");
      }

      const newProfile: FormProfile = {
        ...profile,
        name: profile.name.trim(),
        description: profile.description?.trim() || "",
        data: profile.data || {},
        id: `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Get existing data with safe fallback
      let data: FormProfilesStore;
      try {
        data = await storage.getItem<FormProfilesStore>(FORM_PROFILES_KEY) || { profiles: [] };
      } catch (storageError) {
        console.warn("[SamAI] Storage not available, initializing new store", storageError);
        data = { profiles: [] };
      }

      // Ensure profiles array exists
      if (!Array.isArray(data.profiles)) {
        data.profiles = [];
      }

      // Check for duplicate names
      const existingProfile = data.profiles.find(p => p.name.toLowerCase() === newProfile.name.toLowerCase());
      if (existingProfile) {
        throw new Error(`A profile with the name "${newProfile.name}" already exists`);
      }

      data.profiles.push(newProfile);

      await storage.setItem(FORM_PROFILES_KEY, data);
      console.log("[SamAI] Successfully created profile:", newProfile.name);
      return newProfile;
    } catch (error) {
      console.error("[SamAI] Error creating form profile:", error);
      throw error;
    }
  }

  /**
   * Update an existing profile with validation
   */
  static async updateProfile(id: string, updates: Partial<FormProfile>): Promise<FormProfile | null> {
    try {
      if (!id || !id.trim()) {
        throw new Error("Profile ID is required");
      }

      const data = await storage.getItem<FormProfilesStore>(FORM_PROFILES_KEY);
      if (!Array.isArray(data?.profiles)) {
        throw new Error("No profiles found to update");
      }

      const profileIndex = data.profiles.findIndex((p: FormProfile) => p.id === id);
      if (profileIndex === -1) {
        throw new Error("Profile not found");
      }

      // Validate name uniqueness if name is being updated
      if (updates.name && updates.name.trim()) {
        const nameExists = data.profiles.some((p: FormProfile) =>
          p.id !== id && p.name.toLowerCase() === updates.name!.toLowerCase()
        );
        if (nameExists) {
          throw new Error(`A profile with the name "${updates.name}" already exists`);
        }
      }

      data.profiles[profileIndex] = {
        ...data.profiles[profileIndex],
        ...updates,
        name: updates.name?.trim() || data.profiles[profileIndex].name,
        description: updates.description?.trim() || data.profiles[profileIndex].description,
        updatedAt: new Date().toISOString(),
      };

      await storage.setItem(FORM_PROFILES_KEY, data);
      console.log("[SamAI] Successfully updated profile:", data.profiles[profileIndex].name);
      return data.profiles[profileIndex];
    } catch (error) {
      console.error("[SamAI] Error updating form profile:", error);
      throw error;
    }
  }

  /**
   * Get profiles count
   */
  static async getProfilesCount(): Promise<number> {
    try {
      const profiles = await this.getProfiles();
      return profiles.length;
    } catch (error) {
      console.error("[SamAI] Error getting profiles count:", error);
      return 0;
    }
  }

  /**
   * Clear all profiles (for development/testing)
   */
  static async clearAllProfiles(): Promise<void> {
    try {
      await storage.setItem(FORM_PROFILES_KEY, { profiles: [] });
      console.log("[SamAI] All profiles cleared");
    } catch (error) {
      console.error("[SamAI] Error clearing all profiles:", error);
      throw error;
    }
  }

  /**
   * Delete a profile with enhanced error handling
   */
  static async deleteProfile(id: string): Promise<boolean> {
    try {
      if (!id || !id.trim()) {
        throw new Error("Profile ID is required");
      }

      const data = await storage.getItem<FormProfilesStore>(FORM_PROFILES_KEY);
      if (!Array.isArray(data?.profiles)) {
        throw new Error("No profiles found to delete");
      }

      const profileToDelete = data.profiles.find(p => p.id === id);
      if (!profileToDelete) {
        throw new Error("Profile not found");
      }

      const originalLength = data.profiles.length;
      data.profiles = data.profiles.filter((p: FormProfile) => p.id !== id);

      // If we deleted the active profile, clear the activeProfileId
      if (data.activeProfileId === id) {
        data.activeProfileId = undefined;
        console.log("[SamAI] Cleared active profile since it was deleted");
      }

      await storage.setItem(FORM_PROFILES_KEY, data);
      const wasDeleted = data.profiles.length < originalLength;
      
      if (wasDeleted) {
        console.log("[SamAI] Successfully deleted profile:", profileToDelete.name);
      }
      
      return wasDeleted;
    } catch (error) {
      console.error("[SamAI] Error deleting form profile:", error);
      throw error;
    }
  }

  /**
   * Set active profile with validation
   */
  static async setActiveProfile(id: string): Promise<boolean> {
    try {
      if (!id || !id.trim()) {
        throw new Error("Profile ID is required");
      }

      const data = await storage.getItem<FormProfilesStore>(FORM_PROFILES_KEY);
      if (!Array.isArray(data?.profiles)) {
        throw new Error("No profiles found");
      }

      const profileExists = data.profiles.some((p: FormProfile) => p.id === id);
      if (!profileExists) {
        throw new Error("Profile not found");
      }

      data.activeProfileId = id;
      await storage.setItem(FORM_PROFILES_KEY, data);
      
      const profile = data.profiles.find(p => p.id === id);
      console.log("[SamAI] Set active profile to:", profile?.name || id);
      return true;
    } catch (error) {
      console.error("[SamAI] Error setting active form profile:", error);
      throw error;
    }
  }

  /**
   * Clear active profile
   */
  static async clearActiveProfile(): Promise<void> {
    try {
      const data = await storage.getItem<FormProfilesStore>(FORM_PROFILES_KEY);
      if (!data) return;

      data.activeProfileId = undefined;
      await storage.setItem(FORM_PROFILES_KEY, data);
    } catch (error) {
      console.error("[SamAI] Error clearing active form profile:", error);
      throw error;
    }
  }

  /**
   * Get profile by ID
   */
  static async getProfileById(id: string): Promise<FormProfile | null> {
    try {
      const profiles = await this.getProfiles();
      return profiles.find(p => p.id === id) || null;
    } catch (error) {
      console.error("[SamAI] Error getting form profile by ID:", error);
      return null;
    }
  }

  /**
   * Export profiles as JSON
   */
  static async exportProfiles(): Promise<string> {
    try {
      const data = await storage.getItem<FormProfilesStore>(FORM_PROFILES_KEY);
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error("[SamAI] Error exporting form profiles:", error);
      throw error;
    }
  }

  /**
   * Import profiles from JSON
   */
  static async importProfiles(jsonData: string): Promise<boolean> {
    try {
      const importedData = JSON.parse(jsonData) as FormProfilesStore;
      
      // Validate the imported data structure
      if (!importedData.profiles || !Array.isArray(importedData.profiles)) {
        throw new Error("Invalid profile data format");
      }

      // Validate each profile has required fields
      for (const profile of importedData.profiles) {
        if (!profile.id || !profile.name || !profile.data) {
          throw new Error("Invalid profile structure");
        }
      }

      await storage.setItem(FORM_PROFILES_KEY, importedData);
      return true;
    } catch (error) {
      console.error("[SamAI] Error importing form profiles:", error);
      throw error;
    }
  }

  /**
   * Get field values from active profile for form filling
   */
  static async getProfileFieldValues(): Promise<Record<string, string>> {
    try {
      const activeProfile = await this.getActiveProfile();
      if (!activeProfile) return {};

      const fieldValues: Record<string, string> = {};
      const data = activeProfile.data;

      // Map profile data to common field names
      const mappings: Record<string, string | undefined> = {
        // Name fields
        firstName: data.firstName,
        lastName: data.lastName,
        fullName: data.fullName,
        name: data.fullName || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
        
        // Email fields
        email: data.email,
        workEmail: data.workEmail,
        
        // Phone fields
        phone: data.phone,
        workPhone: data.workPhone,
        telephone: data.phone,
        
        // Address fields
        address: data.address,
        street: data.street,
        city: data.city,
        state: data.state,
        zip: data.zipCode,
        zipCode: data.zipCode,
        country: data.country,
        
        // Professional fields
        company: data.company,
        organization: data.company,
        jobTitle: data.jobTitle,
        title: data.jobTitle,
        position: data.jobTitle,
        
        // Social fields
        website: data.website,
        url: data.website,
        linkedin: data.linkedin,
        github: data.github,
        twitter: data.twitter,
        
        // Other fields
        dateOfBirth: data.dateOfBirth,
        dob: data.dateOfBirth,
      };

      // Add mapped values
      for (const [fieldName, value] of Object.entries(mappings)) {
        if (value && value.trim()) {
          fieldValues[fieldName] = value.trim();
        }
      }

      // Add custom fields
      if (data.customFields) {
        for (const [key, value] of Object.entries(data.customFields)) {
          if (value && value.trim()) {
            fieldValues[key] = value.trim();
          }
        }
      }

      return fieldValues;
    } catch (error) {
      console.error("[SamAI] Error getting profile field values:", error);
      return {};
    }
  }
}