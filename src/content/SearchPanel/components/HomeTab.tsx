import { homeStore } from "@/utils/store";
import React, { useEffect, useState } from "react";

// Types for home icons and folders
export interface HomeIcon {
  id: string;
  name: string;
  url: string;
  iconUrl?: string;
  folderId?: string;
  createdAt: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
}

export interface HomeData {
  icons: HomeIcon[];
  folders: Folder[];
  currentFolderId?: string;
}

type TabId = "home" | "search" | "scrape" | "chat" | "sum" | "form" | "image";

interface HomeTabProps {
  onClose: () => void;
  setActiveTab: (tab: TabId) => void;
  onChatClick: () => void;
}

const HomeTab: React.FC<HomeTabProps> = ({
  onClose,
  setActiveTab,
  onChatClick,
}) => {
  const [homeData, setHomeData] = useState<HomeData>({
    icons: [],
    folders: [],
    currentFolderId: undefined,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingIcon, setIsAddingIcon] = useState(false);
  const [isAddingFolder, setIsAddingFolder] = useState(false);

  // Load home data from storage
  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const store = await homeStore.getValue();
        setHomeData(store.data);
      } catch (error) {
        console.error("Error loading home data:", error);
        // Set default data
        setHomeData({
          icons: getSampleIcons(),
          folders: getSampleFolders(),
          currentFolderId: undefined,
        });
      }
    };
    loadHomeData();
  }, []);

  // Save home data to storage
  const saveHomeData = async (newData: HomeData) => {
    try {
      await homeStore.setValue({
        data: newData,
      });
      setHomeData(newData);
    } catch (error) {
      console.error("Error saving home data:", error);
    }
  };

  // Sample data for testing
  const getSampleIcons = (): HomeIcon[] => [
    {
      id: "1",
      name: "Google",
      url: "https://google.com",
      iconUrl: "https://www.google.com/favicon.ico",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "GitHub",
      url: "https://github.com",
      iconUrl: "https://github.com/favicon.ico",
      createdAt: new Date().toISOString(),
    },
    {
      id: "3",
      name: "YouTube",
      url: "https://youtube.com",
      iconUrl: "https://www.youtube.com/favicon.ico",
      createdAt: new Date().toISOString(),
    },
    {
      id: "4",
      name: "Stack Overflow",
      url: "https://stackoverflow.com",
      iconUrl: "https://stackoverflow.com/favicon.ico",
      createdAt: new Date().toISOString(),
    },
  ];

  const getSampleFolders = (): Folder[] => [
    {
      id: "1",
      name: "Social",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      name: "Development",
      createdAt: new Date().toISOString(),
    },
  ];

  // Get current folder
  const currentFolder = homeData.currentFolderId
    ? homeData.folders.find((f) => f.id === homeData.currentFolderId)
    : null;

  // Get icons for current folder
  const currentIcons = homeData.icons.filter(
    (icon) => icon.folderId === homeData.currentFolderId
  );

  // Get folders for current level (excluding nested folders)
  const currentFolders = homeData.folders.filter(
    (folder) => folder.parentId === homeData.currentFolderId
  );

  // Filter icons by search query
  const filteredIcons = searchQuery
    ? currentIcons.filter(
        (icon) =>
          icon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          icon.url.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : currentIcons;

  // Handle folder navigation
  const navigateToFolder = (folderId: string) => {
    const newData = {
      ...homeData,
      currentFolderId: folderId,
    };
    saveHomeData(newData);
  };

  const goBack = () => {
    const parentFolder = currentFolder?.parentId
      ? homeData.folders.find((f) => f.id === currentFolder.parentId)
      : null;

    const newData = {
      ...homeData,
      currentFolderId: parentFolder?.id,
    };
    saveHomeData(newData);
  };

  const goHome = () => {
    const newData = {
      ...homeData,
      currentFolderId: undefined,
    };
    saveHomeData(newData);
  };

  // Handle icon click
  const handleIconClick = async (icon: HomeIcon) => {
    window.open(icon.url, "_blank");
  };

  // Add new icon
  const handleAddIcon = async (url: string, name: string) => {
    if (!url || !name) return;

    const newIcon: HomeIcon = {
      id: Date.now().toString(),
      name,
      url: url.startsWith("http") ? url : `https://${url}`,
      folderId: homeData.currentFolderId,
      createdAt: new Date().toISOString(),
    };

    const newData = {
      ...homeData,
      icons: [...homeData.icons, newIcon],
    };
    saveHomeData(newData);
    setIsAddingIcon(false);
  };

  // Add new folder
  const handleAddFolder = async (name: string) => {
    if (!name) return;

    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      parentId: homeData.currentFolderId,
      createdAt: new Date().toISOString(),
    };

    const newData = {
      ...homeData,
      folders: [...homeData.folders, newFolder],
    };
    saveHomeData(newData);
    setIsAddingFolder(false);
  };

  // Delete icon
  const handleDeleteIcon = async (iconId: string) => {
    const newData = {
      ...homeData,
      icons: homeData.icons.filter((icon) => icon.id !== iconId),
    };
    saveHomeData(newData);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "rgba(15, 23, 42, 0.95)",
        border: "1px solid rgba(51, 65, 85, 0.6)",
        borderRadius: "1rem",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "0.75rem 1rem",
          borderBottom: "1px solid rgba(51,65,85,0.4)",
          background: "rgba(30,41,59,0.95)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "16px",
              }}
            >
              🏠
            </div>
            <div>
              <div
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  color: "#e2e8f0",
                }}
              >
                Home
              </div>
              <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>
                Quick access to your favorite sites
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            {currentFolder && (
              <button
                onClick={goHome}
                style={{
                  padding: "0.4rem 0.8rem",
                  borderRadius: "0.5rem",
                  border: "1px solid rgba(71, 85, 105, 0.6)",
                  background: "rgba(15, 23, 42, 0.7)",
                  color: "#cbd5f5",
                  fontSize: "0.75rem",
                  cursor: "pointer",
                }}
              >
                🏠 Home
              </button>
            )}

            <button
              onClick={currentFolder ? goBack : undefined}
              disabled={!currentFolder}
              style={{
                padding: "0.4rem 0.8rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(71, 85, 105, 0.6)",
                background: currentFolder
                  ? "rgba(15, 23, 42, 0.7)"
                  : "rgba(15, 23, 42, 0.3)",
                color: currentFolder ? "#cbd5f5" : "#64748b",
                fontSize: "0.75rem",
                cursor: currentFolder ? "pointer" : "not-allowed",
              }}
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Navigation breadcrumb */}
        {currentFolder && (
          <div
            style={{
              fontSize: "0.8rem",
              color: "#94a3b8",
              marginBottom: "0.5rem",
            }}
          >
            <span style={{ cursor: "pointer" }} onClick={goHome}>
              Home
            </span>
            {currentFolder && (
              <>
                <span style={{ margin: "0 0.25rem" }}>/</span>
                <span>{currentFolder.name}</span>
              </>
            )}
          </div>
        )}

        {/* Search and Add */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "relative",
              flex: 1,
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your sites..."
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(71, 85, 105, 0.6)",
                background: "rgba(15, 23, 42, 0.9)",
                color: "#f1f5f9",
                fontSize: "0.8rem",
                outline: "none",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "0.5rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                }}
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => setIsAddingIcon(!isAddingIcon)}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid rgba(34, 197, 94, 0.4)",
              background: "rgba(34, 197, 94, 0.1)",
              color: "#86efac",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            ➕ Add Icon
          </button>

          <button
            onClick={() => setIsAddingFolder(!isAddingFolder)}
            style={{
              padding: "0.5rem 0.75rem",
              borderRadius: "0.5rem",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              background: "rgba(59, 130, 246, 0.1)",
              color: "#93c5fd",
              fontSize: "0.75rem",
              cursor: "pointer",
            }}
          >
            📁 Add Folder
          </button>
        </div>
      </div>

      {/* Add Icon Form */}
      {isAddingIcon && (
        <div
          style={{
            padding: "1rem",
            borderBottom: "1px solid rgba(51,65,85,0.4)",
            background: "rgba(30,41,59,0.5)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="Site name (e.g., Google)"
              id="iconName"
              style={{
                flex: 1,
                padding: "0.5rem",
                borderRadius: "0.375rem",
                border: "1px solid rgba(71, 85, 105, 0.6)",
                background: "rgba(15, 23, 42, 0.9)",
                color: "#f1f5f9",
                fontSize: "0.8rem",
              }}
            />
            <input
              type="text"
              placeholder="URL (e.g., google.com)"
              id="iconUrl"
              style={{
                flex: 1,
                padding: "0.5rem",
                borderRadius: "0.375rem",
                border: "1px solid rgba(71, 85, 105, 0.6)",
                background: "rgba(15, 23, 42, 0.9)",
                color: "#f1f5f9",
                fontSize: "0.8rem",
              }}
            />
            <button
              onClick={() => {
                const name = (
                  document.getElementById("iconName") as HTMLInputElement
                )?.value;
                const url = (
                  document.getElementById("iconUrl") as HTMLInputElement
                )?.value;
                handleAddIcon(url, name);
              }}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.375rem",
                border: "1px solid rgba(34, 197, 94, 0.6)",
                background: "rgba(34, 197, 94, 0.2)",
                color: "#86efac",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              Add
            </button>
            <button
              onClick={() => setIsAddingIcon(false)}
              style={{
                padding: "0.5rem",
                borderRadius: "0.375rem",
                border: "1px solid rgba(239, 68, 68, 0.6)",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#fca5a5",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Add Folder Form */}
      {isAddingFolder && (
        <div
          style={{
            padding: "1rem",
            borderBottom: "1px solid rgba(51,65,85,0.4)",
            background: "rgba(30,41,59,0.5)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="Folder name (e.g., Work)"
              id="folderName"
              style={{
                flex: 1,
                padding: "0.5rem",
                borderRadius: "0.375rem",
                border: "1px solid rgba(71, 85, 105, 0.6)",
                background: "rgba(15, 23, 42, 0.9)",
                color: "#f1f5f9",
                fontSize: "0.8rem",
              }}
            />
            <button
              onClick={() => {
                const name = (
                  document.getElementById("folderName") as HTMLInputElement
                )?.value;
                handleAddFolder(name);
              }}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.375rem",
                border: "1px solid rgba(59, 130, 246, 0.6)",
                background: "rgba(59, 130, 246, 0.2)",
                color: "#93c5fd",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              Add
            </button>
            <button
              onClick={() => setIsAddingFolder(false)}
              style={{
                padding: "0.5rem",
                borderRadius: "0.375rem",
                border: "1px solid rgba(239, 68, 68, 0.6)",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#fca5a5",
                fontSize: "0.8rem",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Content Grid */}
      <div
        style={{
          flex: 1,
          padding: "1rem",
          overflowY: "auto",
        }}
      >
        {/* Folders */}
        {currentFolders.length > 0 && (
          <>
            <h3
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#94a3b8",
                marginBottom: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Folders
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: "0.75rem",
                marginBottom: "1rem",
              }}
            >
              {currentFolders.map((folder) => (
                <div
                  key={folder.id}
                  onClick={() => navigateToFolder(folder.id)}
                  style={{
                    padding: "1rem 0.75rem",
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(71, 85, 105, 0.6)",
                    background: "rgba(15, 23, 42, 0.8)",
                    color: "#cbd5f5",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      fontSize: "1.5rem",
                    }}
                  >
                    📁
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 500,
                    }}
                  >
                    {folder.name}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Icons */}
        {filteredIcons.length > 0 && (
          <>
            <h3
              style={{
                fontSize: "0.8rem",
                fontWeight: 600,
                color: "#94a3b8",
                marginBottom: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Sites
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: "0.75rem",
              }}
            >
              {filteredIcons.map((icon) => (
                <div
                  key={icon.id}
                  style={{
                    position: "relative",
                    padding: "1rem 0.75rem",
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(71, 85, 105, 0.6)",
                    background: "rgba(15, 23, 42, 0.8)",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                  onClick={() => handleIconClick(icon)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteIcon(icon.id);
                    }}
                    style={{
                      position: "absolute",
                      top: "0.5rem",
                      right: "0.5rem",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      border: "none",
                      background: "rgba(239, 68, 68, 0.8)",
                      color: "white",
                      fontSize: "0.7rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.2s ease",
                    }}
                  >
                    ✕
                  </button>

                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "8px",
                      background: "rgba(59, 130, 246, 0.2)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      border: "1px solid rgba(59, 130, 246, 0.4)",
                    }}
                  >
                    {icon.iconUrl ? (
                      <img
                        src={icon.iconUrl}
                        alt={icon.name}
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "4px",
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          target.nextElementSibling!.textContent = icon.name
                            .charAt(0)
                            .toUpperCase();
                        }}
                      />
                    ) : (
                      <span>📄</span>
                    )}
                    <span style={{ display: "none" }}>
                      {icon.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 500,
                      color: "#e2e8f0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: "100%",
                    }}
                  >
                    {icon.name}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Empty State */}
        {filteredIcons.length === 0 && currentFolders.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "2rem",
              color: "#94a3b8",
            }}
          >
            <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>
              {searchQuery ? "🔍" : "🏠"}
            </div>
            <div
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                marginBottom: "0.5rem",
              }}
            >
              {searchQuery ? "No sites found" : "Your home is empty"}
            </div>
            <div style={{ fontSize: "0.9rem", marginBottom: "1rem" }}>
              {searchQuery
                ? "Try a different search term"
                : "Add some sites or create folders to get started"}
            </div>
            {!searchQuery && (
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => setIsAddingIcon(true)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "0.5rem",
                    border: "1px solid rgba(34, 197, 94, 0.4)",
                    background: "rgba(34, 197, 94, 0.1)",
                    color: "#86efac",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                  }}
                >
                  Add Your First Site
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeTab;
