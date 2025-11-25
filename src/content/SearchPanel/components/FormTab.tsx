import { AutoFormFiller } from '@/utils/autoFormFiller';
import { FormProfilesManager, type FormProfile } from '@/utils/formProfiles';
import React, { useEffect, useState } from 'react';

interface FormTabProps {
  onFormClick: () => void;
}

interface FormAnalysis {
  hasForms: boolean;
  fieldCount: number;
  formCount: number;
  fields: Array<{
    name?: string;
    id?: string;
    type: string;
    label?: string;
    placeholder?: string;
  }>;
}

interface FillResult {
  success: boolean;
  error?: string;
  filledFields: string[];
  fieldCount: number;
  formCount: number;
}

export const FormTab: React.FC<FormTabProps> = ({ onFormClick }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isFilling, setIsFilling] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [formAnalysis, setFormAnalysis] = useState<FormAnalysis | null>(null);
  const [fillResult, setFillResult] = useState<FillResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [useProfileData, setUseProfileData] = useState(false);
  const [profiles, setProfiles] = useState<FormProfile[]>([]);
  const [activeProfile, setActiveProfile] = useState<FormProfile | null>(null);
  const [showProfileManager, setShowProfileManager] = useState(false);
  
  // Profile editing states
  const [editingProfileId, setEditingProfileId] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState({
    name: '',
    description: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    company: '',
    jobTitle: ''
  });
  
  const [newProfile, setNewProfile] = useState({
    name: '',
    description: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    company: '',
    jobTitle: ''
  });

  // Load profiles on component mount with error handling
  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      console.log('[SamAI] Loading profiles...');
      const allProfiles = await FormProfilesManager.getProfiles();
      const active = await FormProfilesManager.getActiveProfile();
      
      console.log(`[SamAI] Loaded ${allProfiles.length} profiles, active: ${active?.name || 'none'}`);
      setProfiles(allProfiles);
      setActiveProfile(active);
    } catch (err) {
      console.error('[SamAI] Error loading profiles:', err);
      setError('Failed to load profiles. Please try refreshing the page.');
    }
  };

  // Analyze forms when component mounts
  useEffect(() => {
    analyzeForms();
  }, []);

  const analyzeForms = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const analysis = await AutoFormFiller.analyzeForms();
      setFormAnalysis(analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze forms');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFillForms = async () => {
    if (!useProfileData && !instructions.trim()) {
      setError('Please provide instructions for filling the form or enable profile data.');
      return;
    }

    if (useProfileData && !activeProfile) {
      setError('Please select an active profile for profile-based filling.');
      return;
    }

    setIsFilling(true);
    setError(null);
    setFillResult(null);

    try {
      let finalInstructions = instructions;
      
      if (useProfileData && activeProfile) {
        const profileData = await FormProfilesManager.getProfileFieldValues();
        const profileInfo = Object.entries(profileData)
          .filter(([_, value]) => value && value.trim())
          .map(([key, value]) => `${key}: ${value}`)
          .join(', ');
        
        finalInstructions = `Use the following profile data to fill the form: ${profileInfo}. ${instructions}`;
      }

      const result = await AutoFormFiller.fillForms(finalInstructions);
      setFillResult(result);
      
      if (!result.success && result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fill forms');
    } finally {
      setIsFilling(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!newProfile.name.trim()) {
      setError('Profile name is required');
      return;
    }

    try {
      const profileData = {
        name: newProfile.name,
        description: newProfile.description,
        data: {
          firstName: newProfile.firstName,
          lastName: newProfile.lastName,
          email: newProfile.email,
          phone: newProfile.phone,
          address: newProfile.address,
          city: newProfile.city,
          state: newProfile.state,
          zipCode: newProfile.zipCode,
          country: newProfile.country,
          company: newProfile.company,
          jobTitle: newProfile.jobTitle
        }
      };

      await FormProfilesManager.createProfile(profileData);
      await loadProfiles();
      
      // Reset form
      setNewProfile({
        name: '',
        description: '',
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
        company: '',
        jobTitle: ''
      });
      
      setShowProfileManager(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create profile');
    }
  };

  const handleSetActiveProfile = async (profileId: string) => {
    try {
      await FormProfilesManager.setActiveProfile(profileId);
      await loadProfiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set active profile');
    }
  };

  const handleDeleteProfile = async (profileId: string) => {
    try {
      await FormProfilesManager.deleteProfile(profileId);
      await loadProfiles();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete profile');
    }
  };

  const handleStartEditProfile = (profile: FormProfile) => {
    setEditingProfileId(profile.id);
    setEditingProfile({
      name: profile.name,
      description: profile.description || '',
      firstName: profile.data.firstName || '',
      lastName: profile.data.lastName || '',
      email: profile.data.email || '',
      phone: profile.data.phone || '',
      address: profile.data.address || '',
      city: profile.data.city || '',
      state: profile.data.state || '',
      zipCode: profile.data.zipCode || '',
      country: profile.data.country || '',
      company: profile.data.company || '',
      jobTitle: profile.data.jobTitle || ''
    });
  };

  const handleCancelEditProfile = () => {
    setEditingProfileId(null);
    setEditingProfile({
      name: '',
      description: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
      company: '',
      jobTitle: ''
    });
  };

  const handleUpdateProfile = async () => {
    if (!editingProfileId || !editingProfile.name.trim()) {
      setError('Profile name is required');
      return;
    }

    try {
      const updatedProfile = {
        name: editingProfile.name,
        description: editingProfile.description,
        data: {
          firstName: editingProfile.firstName,
          lastName: editingProfile.lastName,
          email: editingProfile.email,
          phone: editingProfile.phone,
          address: editingProfile.address,
          city: editingProfile.city,
          state: editingProfile.state,
          zipCode: editingProfile.zipCode,
          country: editingProfile.country,
          company: editingProfile.company,
          jobTitle: editingProfile.jobTitle
        }
      };

      await FormProfilesManager.updateProfile(editingProfileId, updatedProfile);
      await loadProfiles();
      
      handleCancelEditProfile();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  const renderProfileManager = () => {
    if (!showProfileManager) return null;

    return (
      <div
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
          border: "1px solid rgba(168, 85, 247, 0.3)",
          borderRadius: "0.75rem",
          padding: "1rem",
          marginBottom: "1rem",
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ fontSize: "0.9rem", fontWeight: 600, color: "#c084fc", margin: 0 }}>
            Form Profile Manager
          </h4>
          <button
            onClick={() => setShowProfileManager(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            ✕
          </button>
        </div>

        {/* Existing Profiles */}
        {profiles.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <h5 style={{ fontSize: "0.8rem", color: "#e2e8f0", marginBottom: "0.5rem" }}>
              Existing Profiles
            </h5>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {profiles.map((profile) => (
                <div key={profile.id}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: "0.5rem",
                      background: "rgba(168, 85, 247, 0.1)",
                      borderRadius: "0.375rem",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "0.8rem", color: "#e2e8f0" }}>
                        {profile.name}
                        {activeProfile?.id === profile.id && (
                          <span style={{ color: "#34d399", marginLeft: "0.5rem", fontSize: "0.7rem" }}>
                            (Active)
                          </span>
                        )}
                      </div>
                      {profile.description && (
                        <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                          {profile.description}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button
                        onClick={() => handleStartEditProfile(profile)}
                        style={{
                          padding: "0.25rem 0.5rem",
                          background: "rgba(168, 85, 247, 0.2)",
                          border: "1px solid rgba(168, 85, 247, 0.4)",
                          borderRadius: "0.25rem",
                          color: "#c084fc",
                          cursor: "pointer",
                          fontSize: "0.7rem",
                        }}
                      >
                        Edit
                      </button>
                      {activeProfile?.id !== profile.id && (
                        <button
                          onClick={() => handleSetActiveProfile(profile.id)}
                          style={{
                            padding: "0.25rem 0.5rem",
                            background: "rgba(16, 185, 129, 0.2)",
                            border: "1px solid rgba(16, 185, 129, 0.4)",
                            borderRadius: "0.25rem",
                            color: "#34d399",
                            cursor: "pointer",
                            fontSize: "0.7rem",
                          }}
                        >
                          Set Active
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteProfile(profile.id)}
                        style={{
                          padding: "0.25rem 0.5rem",
                          background: "rgba(239, 68, 68, 0.2)",
                          border: "1px solid rgba(239, 68, 68, 0.4)",
                          borderRadius: "0.25rem",
                          color: "#f87171",
                          cursor: "pointer",
                          fontSize: "0.7rem",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {editingProfileId === profile.id && (
                    <div
                      style={{
                        marginTop: '0.75rem',
                        padding: '1rem',
                        background: "rgba(30, 41, 59, 0.5)",
                        border: "1px solid rgba(168, 85, 247, 0.2)",
                        borderRadius: "0.5rem",
                      }}
                    >
                      <h6 style={{ fontSize: "0.8rem", color: "#c084fc", marginBottom: "0.75rem" }}>
                        Edit Profile
                      </h6>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem", marginBottom: '0.75rem' }}>
                        <input
                          type="text"
                          placeholder="Profile Name *"
                          value={editingProfile.name}
                          onChange={(e) => setEditingProfile({...editingProfile, name: e.target.value})}
                          style={{
                            padding: "0.5rem",
                            background: "rgba(15, 23, 42, 0.8)",
                            border: "1px solid rgba(168, 85, 247, 0.3)",
                            borderRadius: "0.375rem",
                            fontSize: "0.8rem",
                            color: "#f1f5f9",
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Description"
                          value={editingProfile.description}
                          onChange={(e) => setEditingProfile({...editingProfile, description: e.target.value})}
                          style={{
                            padding: "0.5rem",
                            background: "rgba(15, 23, 42, 0.8)",
                            border: "1px solid rgba(168, 85, 247, 0.3)",
                            borderRadius: "0.375rem",
                            fontSize: "0.8rem",
                            color: "#f1f5f9",
                          }}
                        />
                        <input
                          type="text"
                          placeholder="First Name"
                          value={editingProfile.firstName}
                          onChange={(e) => setEditingProfile({...editingProfile, firstName: e.target.value})}
                          style={{
                            padding: "0.5rem",
                            background: "rgba(15, 23, 42, 0.8)",
                            border: "1px solid rgba(168, 85, 247, 0.3)",
                            borderRadius: "0.375rem",
                            fontSize: "0.8rem",
                            color: "#f1f5f9",
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Last Name"
                          value={editingProfile.lastName}
                          onChange={(e) => setEditingProfile({...editingProfile, lastName: e.target.value})}
                          style={{
                            padding: "0.5rem",
                            background: "rgba(15, 23, 42, 0.8)",
                            border: "1px solid rgba(168, 85, 247, 0.3)",
                            borderRadius: "0.375rem",
                            fontSize: "0.8rem",
                            color: "#f1f5f9",
                          }}
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={editingProfile.email}
                          onChange={(e) => setEditingProfile({...editingProfile, email: e.target.value})}
                          style={{
                            padding: "0.5rem",
                            background: "rgba(15, 23, 42, 0.8)",
                            border: "1px solid rgba(168, 85, 247, 0.3)",
                            borderRadius: "0.375rem",
                            fontSize: "0.8rem",
                            color: "#f1f5f9",
                          }}
                        />
                        <input
                          type="tel"
                          placeholder="Phone"
                          value={editingProfile.phone}
                          onChange={(e) => setEditingProfile({...editingProfile, phone: e.target.value})}
                          style={{
                            padding: "0.5rem",
                            background: "rgba(15, 23, 42, 0.8)",
                            border: "1px solid rgba(168, 85, 247, 0.3)",
                            borderRadius: "0.375rem",
                            fontSize: "0.8rem",
                            color: "#f1f5f9",
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Address"
                          value={editingProfile.address}
                          onChange={(e) => setEditingProfile({...editingProfile, address: e.target.value})}
                          style={{
                            padding: "0.5rem",
                            background: "rgba(15, 23, 42, 0.8)",
                            border: "1px solid rgba(168, 85, 247, 0.3)",
                            borderRadius: "0.375rem",
                            fontSize: "0.8rem",
                            color: "#f1f5f9",
                          }}
                        />
                        <input
                          type="text"
                          placeholder="City"
                          value={editingProfile.city}
                          onChange={(e) => setEditingProfile({...editingProfile, city: e.target.value})}
                          style={{
                            padding: "0.5rem",
                            background: "rgba(15, 23, 42, 0.8)",
                            border: "1px solid rgba(168, 85, 247, 0.3)",
                            borderRadius: "0.375rem",
                            fontSize: "0.8rem",
                            color: "#f1f5f9",
                          }}
                        />
                        <input
                          type="text"
                          placeholder="State"
                          value={editingProfile.state}
                          onChange={(e) => setEditingProfile({...editingProfile, state: e.target.value})}
                          style={{
                            padding: "0.5rem",
                            background: "rgba(15, 23, 0.8)",
                            border: "1px solid rgba(168, 85, 247, 0.3)",
                            borderRadius: "0.375rem",
                            fontSize: "0.8rem",
                            color: "#f1f5f9",
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Zip Code"
                          value={editingProfile.zipCode}
                          onChange={(e) => setEditingProfile({...editingProfile, zipCode: e.target.value})}
                          style={{
                            padding: "0.5rem",
                            background: "rgba(15, 23, 42, 0.8)",
                            border: "1px solid rgba(168, 85, 247, 0.3)",
                            borderRadius: "0.375rem",
                            fontSize: "0.8rem",
                            color: "#f1f5f9",
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Country"
                          value={editingProfile.country}
                          onChange={(e) => setEditingProfile({...editingProfile, country: e.target.value})}
                          style={{
                            padding: "0.5rem",
                            background: "rgba(15, 23, 42, 0.8)",
                            border: "1px solid rgba(168, 85, 247, 0.3)",
                            borderRadius: "0.375rem",
                            fontSize: "0.8rem",
                            color: "#f1f5f9",
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Company"
                          value={editingProfile.company}
                          onChange={(e) => setEditingProfile({...editingProfile, company: e.target.value})}
                          style={{
                            padding: "0.5rem",
                            background: "rgba(15, 23, 42, 0.8)",
                            border: "1px solid rgba(168, 85, 245, 0.3)",
                            borderRadius: "0.375rem",
                            fontSize: "0.8rem",
                            color: "#f1f5f9",
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Job Title"
                          value={editingProfile.jobTitle}
                          onChange={(e) => setEditingProfile({...editingProfile, jobTitle: e.target.value})}
                          style={{
                            padding: "0.5rem",
                            background: "rgba(15, 23, 42, 0.8)",
                            border: "1px solid rgba(168, 85, 247, 0.3)",
                            borderRadius: "0.375rem",
                            fontSize: "0.8rem",
                            color: "#f1f5f9",
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={handleUpdateProfile}
                          style={{
                            padding: "0.5rem 1rem",
                            background: "linear-gradient(135deg, #10b981, #059669)",
                            border: "none",
                            borderRadius: "0.375rem",
                            color: "white",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                          }}
                        >
                          Update Profile
                        </button>
                        <button
                          onClick={handleCancelEditProfile}
                          style={{
                            padding: "0.5rem 1rem",
                            background: "rgba(71, 85, 105, 0.6)",
                            border: "1px solid rgba(100, 116, 139, 0.6)",
                            borderRadius: "0.375rem",
                            color: "#cbd5e1",
                            fontSize: "0.8rem",
                            cursor: "pointer",
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create New Profile */}
        <div>
          <h5 style={{ fontSize: "0.8rem", color: "#e2e8f0", marginBottom: "0.5rem" }}>
            Create New Profile
          </h5>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
            <input
              type="text"
              placeholder="Profile Name *"
              value={newProfile.name}
              onChange={(e) => setNewProfile({...newProfile, name: e.target.value})}
              style={{
                padding: "0.5rem",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                borderRadius: "0.375rem",
                fontSize: "0.8rem",
                color: "#f1f5f9",
              }}
            />
            <input
              type="text"
              placeholder="Description"
              value={newProfile.description}
              onChange={(e) => setNewProfile({...newProfile, description: e.target.value})}
              style={{
                padding: "0.5rem",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                borderRadius: "0.375rem",
                fontSize: "0.8rem",
                color: "#f1f5f9",
              }}
            />
            <input
              type="text"
              placeholder="First Name"
              value={newProfile.firstName}
              onChange={(e) => setNewProfile({...newProfile, firstName: e.target.value})}
              style={{
                padding: "0.5rem",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                borderRadius: "0.375rem",
                fontSize: "0.8rem",
                color: "#f1f5f9",
              }}
            />
            <input
              type="text"
              placeholder="Last Name"
              value={newProfile.lastName}
              onChange={(e) => setNewProfile({...newProfile, lastName: e.target.value})}
              style={{
                padding: "0.5rem",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                borderRadius: "0.375rem",
                fontSize: "0.8rem",
                color: "#f1f5f9",
              }}
            />
            <input
              type="email"
              placeholder="Email"
              value={newProfile.email}
              onChange={(e) => setNewProfile({...newProfile, email: e.target.value})}
              style={{
                padding: "0.5rem",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                borderRadius: "0.375rem",
                fontSize: "0.8rem",
                color: "#f1f5f9",
              }}
            />
            <input
              type="tel"
              placeholder="Phone"
              value={newProfile.phone}
              onChange={(e) => setNewProfile({...newProfile, phone: e.target.value})}
              style={{
                padding: "0.5rem",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                borderRadius: "0.375rem",
                fontSize: "0.8rem",
                color: "#f1f5f9",
              }}
            />
            <input
              type="text"
              placeholder="Address"
              value={newProfile.address}
              onChange={(e) => setNewProfile({...newProfile, address: e.target.value})}
              style={{
                padding: "0.5rem",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                borderRadius: "0.375rem",
                fontSize: "0.8rem",
                color: "#f1f5f9",
              }}
            />
            <input
              type="text"
              placeholder="City"
              value={newProfile.city}
              onChange={(e) => setNewProfile({...newProfile, city: e.target.value})}
              style={{
                padding: "0.5rem",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                borderRadius: "0.375rem",
                fontSize: "0.8rem",
                color: "#f1f5f9",
              }}
            />
            <input
              type="text"
              placeholder="State"
              value={newProfile.state}
              onChange={(e) => setNewProfile({...newProfile, state: e.target.value})}
              style={{
                padding: "0.5rem",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                borderRadius: "0.375rem",
                fontSize: "0.8rem",
                color: "#f1f5f9",
              }}
            />
            <input
              type="text"
              placeholder="Zip Code"
              value={newProfile.zipCode}
              onChange={(e) => setNewProfile({...newProfile, zipCode: e.target.value})}
              style={{
                padding: "0.5rem",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                borderRadius: "0.375rem",
                fontSize: "0.8rem",
                color: "#f1f5f9",
              }}
            />
            <input
              type="text"
              placeholder="Country"
              value={newProfile.country}
              onChange={(e) => setNewProfile({...newProfile, country: e.target.value})}
              style={{
                padding: "0.5rem",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                borderRadius: "0.375rem",
                fontSize: "0.8rem",
                color: "#f1f5f9",
              }}
            />
            <input
              type="text"
              placeholder="Company"
              value={newProfile.company}
              onChange={(e) => setNewProfile({...newProfile, company: e.target.value})}
              style={{
                padding: "0.5rem",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                borderRadius: "0.375rem",
                fontSize: "0.8rem",
                color: "#f1f5f9",
              }}
            />
            <input
              type="text"
              placeholder="Job Title"
              value={newProfile.jobTitle}
              onChange={(e) => setNewProfile({...newProfile, jobTitle: e.target.value})}
              style={{
                padding: "0.5rem",
                background: "rgba(15, 23, 42, 0.8)",
                border: "1px solid rgba(168, 85, 247, 0.3)",
                borderRadius: "0.375rem",
                fontSize: "0.8rem",
                color: "#f1f5f9",
              }}
            />
          </div>
          <button
            onClick={handleCreateProfile}
            style={{
              marginTop: "0.5rem",
              padding: "0.5rem 1rem",
              background: "linear-gradient(135deg, #10b981, #059669)",
              border: "none",
              borderRadius: "0.375rem",
              color: "white",
              fontSize: "0.8rem",
              cursor: "pointer",
            }}
          >
            Create Profile
          </button>
        </div>
      </div>
    );
  };

  const renderAnalysisResults = () => {
    if (!formAnalysis) return null;

    if (!formAnalysis.hasForms) {
      return (
        <div
          style={{
            color: "#94a3b8",
            fontSize: "0.85rem",
            textAlign: "center",
            padding: "1rem",
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            borderRadius: "0.75rem",
          }}
        >
          <p>No forms detected on this page.</p>
          <button
            onClick={analyzeForms}
            style={{
              marginTop: "0.5rem",
              padding: "0.5rem 1rem",
              background: "rgba(168, 85, 247, 0.2)",
              border: "1px solid rgba(168, 85, 247, 0.4)",
              borderRadius: "0.5rem",
              color: "#c084fc",
              cursor: "pointer",
              fontSize: "0.8rem",
            }}
          >
            Refresh Analysis
          </button>
        </div>
      );
    }

    return (
      <div
        style={{
          background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
          border: "1px solid rgba(168, 85, 247, 0.3)",
          borderRadius: "0.75rem",
          padding: "1rem",
          marginBottom: "1rem",
        }}
      >
        <h4
          style={{
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "#c084fc",
            marginBottom: "0.75rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Form Analysis Results
        </h4>
        
        <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginBottom: "0.75rem" }}>
          <div>📋 Forms detected: {formAnalysis.formCount}</div>
          <div>📝 Form fields: {formAnalysis.fieldCount}</div>
        </div>

        {formAnalysis.fields.length > 0 && (
          <div style={{ maxHeight: "200px", overflowY: "auto" }}>
            <h5 style={{ fontSize: "0.8rem", color: "#c084fc", marginBottom: "0.5rem" }}>
              Detected Fields:
            </h5>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {formAnalysis.fields.slice(0, 10).map((field, index) => (
                <div
                  key={index}
                  style={{
                    padding: "0.5rem",
                    background: "rgba(168, 85, 247, 0.1)",
                    borderRadius: "0.375rem",
                    fontSize: "0.75rem",
                  }}
                >
                  <div style={{ color: "#e2e8f0" }}>
                    {field.label || field.name || field.id || `Field ${index + 1}`}
                  </div>
                  <div style={{ color: "#94a3b8", marginTop: "0.25rem" }}>
                    Type: {field.type}
                    {field.placeholder && ` • Placeholder: ${field.placeholder}`}
                  </div>
                </div>
              ))}
              {formAnalysis.fields.length > 10 && (
                <div style={{ fontSize: "0.75rem", color: "#64748b", textAlign: "center", padding: "0.5rem" }}>
                  ... and {formAnalysis.fields.length - 10} more fields
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={analyzeForms}
          style={{
            marginTop: "0.75rem",
            padding: "0.5rem 1rem",
            background: "rgba(168, 85, 247, 0.2)",
            border: "1px solid rgba(168, 85, 247, 0.4)",
            borderRadius: "0.5rem",
            color: "#c084fc",
            cursor: "pointer",
            fontSize: "0.8rem",
            width: "100%",
          }}
        >
          Refresh Analysis
        </button>
      </div>
    );
  };

  const renderFillResult = () => {
    if (!fillResult) return null;

    if (fillResult.success) {
      return (
        <div
          style={{
            background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(45, 212, 191, 0.05))",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "0.75rem",
            padding: "1rem",
            marginBottom: "1rem",
          }}
        >
          <h4
            style={{
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#34d399",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Forms Filled Successfully!
          </h4>
          
          <div style={{ fontSize: "0.8rem", color: "#6ee7b7", marginBottom: "0.5rem" }}>
            ✅ Filled {fillResult.filledFields.length} out of {fillResult.fieldCount} fields
          </div>
          
          {fillResult.filledFields.length > 0 && (
            <div style={{ fontSize: "0.75rem", color: "#a7f3d0" }}>
              <div style={{ marginBottom: "0.25rem" }}>Filled fields:</div>
              <div style={{ background: "rgba(16, 185, 129, 0.1)", padding: "0.5rem", borderRadius: "0.375rem" }}>
                {fillResult.filledFields.join(', ')}
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        style={{
          background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(248, 113, 113, 0.05))",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "0.75rem",
          padding: "1rem",
          marginBottom: "1rem",
        }}
      >
        <h4
          style={{
            fontSize: "0.9rem",
            fontWeight: 600,
            color: "#f87171",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Form Filling Failed
        </h4>
        <div style={{ fontSize: "0.8rem", color: "#fca5a5" }}>
          {fillResult.error}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        border: "1px solid rgba(51, 65, 85, 0.6)",
        borderRadius: "1rem",
        background: "rgba(15, 23, 42, 0.95)",
        boxShadow: "0 24px 45px -18px rgba(0,0,0,0.65)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.75rem 1rem",
          borderBottom: "1px solid rgba(51,65,85,0.4)",
          background: "rgba(30,41,59,0.95)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "36px",
              height: "36px",
              borderRadius: "10px",
              background: "linear-gradient(135deg,#a855f7,#9333ea)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 16px rgba(168, 85, 247, 0.35)",
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </div>
          <div>
            <div
              style={{ fontSize: "0.9rem", fontWeight: 700, color: "#a855f7" }}
            >
              Smart Form Filler
            </div>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
              AI-powered automatic form filling with profiles
            </div>
          </div>
        </div>
        {isAnalyzing && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.45rem",
              padding: "0.3rem 0.8rem",
              borderRadius: "999px",
              border: "1px solid rgba(168, 85, 247, 0.35)",
              background: "rgba(168, 85, 247, 0.12)",
              fontSize: "0.7rem",
              color: "#c084fc",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                border: "2px solid rgba(168, 85, 247, 0.5)",
                borderTopColor: "#a855f7",
                animation: "samai-spin 0.6s linear infinite",
              }}
            />
            Analyzing...
          </div>
        )}
      </div>

      <div
        style={{
          flex: 1,
          padding: "0.75rem",
          overflowY: "auto",
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        {error && (
          <div
            style={{
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(248, 113, 113, 0.05))",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "0.75rem",
              padding: "0.75rem",
              fontSize: "0.8rem",
              color: "#fca5a5",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {renderFillResult()}

        {/* Profile Manager */}
        {renderProfileManager()}

        {/* Profile Options */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            borderRadius: "0.75rem",
            padding: "1rem",
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#e2e8f0" }}>
              Form Filling Options
            </label>
            <button
              onClick={() => setShowProfileManager(!showProfileManager)}
              style={{
                padding: "0.25rem 0.5rem",
                background: "rgba(168, 85, 247, 0.2)",
                border: "1px solid rgba(168, 85, 247, 0.4)",
                borderRadius: "0.375rem",
                color: "#c084fc",
                cursor: "pointer",
                fontSize: "0.7rem",
              }}
            >
              {showProfileManager ? 'Hide' : 'Manage'} Profiles
            </button>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={useProfileData}
                onChange={(e) => setUseProfileData(e.target.checked)}
                style={{ margin: 0 }}
              />
              <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                Use Profile Data
              </span>
            </label>
            {activeProfile && (
              <span style={{ fontSize: "0.7rem", color: "#34d399" }}>
                Active: {activeProfile.name}
              </span>
            )}
          </div>
          
          {useProfileData && !activeProfile && (
            <div style={{ fontSize: "0.75rem", color: "#f59e0b", marginBottom: "0.5rem" }}>
              ⚠️ No active profile selected. Enable profile management to create and select a profile.
            </div>
          )}
        </div>

        {/* Instructions Input */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
            border: "1px solid rgba(168, 85, 247, 0.3)",
            borderRadius: "0.75rem",
            padding: "1rem",
          }}
        >
          <label
            style={{
              display: "block",
              fontSize: "0.85rem",
              fontWeight: 600,
              color: "#e2e8f0",
              marginBottom: "0.5rem",
            }}
          >
            Fill Instructions {useProfileData ? '(Optional with profile data)' : ''}
          </label>
          <textarea
            value={instructions}
            onChange={(e) => setInstructions(e.target.value)}
            placeholder={
              useProfileData 
                ? "Additional instructions for profile-based filling (e.g., 'Fill out this contact form', 'Complete the shipping information')"
                : "e.g., 'Fill out this contact form with John Doe's information', 'Use my resume data to complete this job application', 'Fill in shipping information for my order'..."
            }
            style={{
              width: "100%",
              minHeight: "80px",
              padding: "0.75rem",
              background: "rgba(15, 23, 42, 0.8)",
              border: "1px solid rgba(168, 85, 247, 0.3)",
              borderRadius: "0.5rem",
              fontSize: "0.85rem",
              color: "#f1f5f9",
              resize: "vertical",
              lineHeight: "1.4",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "rgba(168, 85, 247, 0.6)";
              e.target.style.boxShadow = "0 0 0 3px rgba(168, 85, 247, 0.2)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "rgba(168, 85, 247, 0.3)";
              e.target.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Fill Button */}
        <button
          onClick={handleFillForms}
          disabled={isFilling || isAnalyzing || !formAnalysis?.hasForms || (!useProfileData && !instructions.trim()) || (useProfileData && !activeProfile)}
          style={{
            width: "100%",
            padding: "0.875rem 1.25rem",
            background: isFilling || isAnalyzing || !formAnalysis?.hasForms || (!useProfileData && !instructions.trim()) || (useProfileData && !activeProfile)
              ? "linear-gradient(135deg, rgba(71, 85, 105, 0.6), rgba(51, 65, 85, 0.6))"
              : "linear-gradient(135deg, #a855f7, #9333ea)",
            border: "none",
            borderRadius: "0.75rem",
            color: "white",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: isFilling || isAnalyzing || !formAnalysis?.hasForms || (!useProfileData && !instructions.trim()) || (useProfileData && !activeProfile) ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            boxShadow: isFilling || isAnalyzing || !formAnalysis?.hasForms || (!useProfileData && !instructions.trim()) || (useProfileData && !activeProfile)
              ? "none"
              : "0 8px 25px -8px rgba(168, 85, 247, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
          }}
        >
          {isFilling ? (
            <>
              <div style={{
                width: "16px",
                height: "16px",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                borderTop: "2px solid white",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }} />
              Filling Forms...
            </>
          ) : (
            <>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Fill Forms {useProfileData ? 'with Profile' : 'with AI'}
            </>
          )}
        </button>

        {renderAnalysisResults()}
      </div>
    </div>
  );
};