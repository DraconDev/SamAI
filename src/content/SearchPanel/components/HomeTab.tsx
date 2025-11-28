import { homeStore } from "@/utils/store";
import React, { useCallback, useEffect, useState } from "react";

// Enhanced types with order field for drag and drop
export interface HomeIcon {
  id: string;
  name: string;
  url: string;
  iconUrl?: string;
  folderId?: string;
  createdAt: string;
  order?: number; // For drag and drop ordering
}

export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
  order?: number; // For drag and drop ordering
}

export interface HomeData {
  icons: HomeIcon[];
  folders: Folder[];
  currentFolderId?: string;
}

interface HomeTabProps {
  // Home tab is self-contained, no props needed
}

// Drag and drop types
interface DragItem {
  id: string;
  type: "icon" | "folder";
  index: number;
}

const HomeTab: React.FC<HomeTabProps> = () => {
  const [homeData, setHomeData] = useState<HomeData>({
    icons: [],
    folders: [],
    currentFolderId: undefined,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingIcon, setIsAddingIcon] = useState(false);
  const [isAddingFolder, setIsAddingFolder] = useState(false);
  const [newIconName, setNewIconName] = useState("");
  const [newIconUrl, setNewIconUrl] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [faviconCache, setFaviconCache] = useState<Map<string, string>>(
    new Map()
  );

  // Load home data from storage
  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const store = await homeStore.getValue();
        setHomeData(store.data);
      } catch (error) {
        console.error("Error loading home data:", error);
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

  // Fetch favicon for a URL
  const fetchFavicon = useCallback(
    async (url: string): Promise<string | null> => {
      try {
        const domain = new URL(url).hostname;

        // Check cache first
        if (faviconCache.has(domain)) {
          return faviconCache.get(domain) || null;
        }

        // Try multiple favicon sources
        const faviconSources = [
          `https://${domain}/favicon.ico`,
          `https://${domain}/favicon.png`,
          `https://icons.duckduckgo.com/ip3/${domain}.ico`,
          `https://www.google.com/s2/favicons?domain=${domain}&sz=32`,
        ];

        for (const faviconUrl of faviconSources) {
          try {
            const response = await fetch(faviconUrl, { method: "HEAD" });
            if (response.ok) {
              // Cache the successful favicon
              const newCache = new Map(faviconCache);
              newCache.set(domain, faviconUrl);
              setFaviconCache(newCache);
              return faviconUrl;
            }
          } catch (e) {
            continue; // Try next source
          }
        }

        return null;
      } catch (error) {
        console.warn("Failed to fetch favicon for:", url);
        return null;
      }
    },
    [faviconCache]
  );

  // Add current site with auto-fetched favicon
  const addCurrentSite = async () => {
    const url = window.location.href;
    const name = document.title || "Current Page";

    // Fetch favicon
    const iconUrl = await fetchFavicon(url);

    const newIcon: HomeIcon = {
      id: Date.now().toString(),
      name: name.length > 30 ? name.substring(0, 30) + "..." : name,
      url,
      iconUrl: iconUrl || undefined,
      folderId: homeData.currentFolderId,
      createdAt: new Date().toISOString(),
      order: homeData.icons.length,
    };

    const newData = {
      ...homeData,
      icons: [...homeData.icons, newIcon],
    };
    await saveHomeData(newData);
  };

  // Add current site with auto-fetched favicon



  // Sample data for testing
  const getSampleIcons = (): HomeIcon[] => [


  // Sample data for testing



  // Get current folder
  const getSampleIcons = (): HomeIcon[] => [
  const addCurrentSite = async () => {
    const url = window.location.href;
    const name = document.title || "Current Page";

    // Fetch favicon
    const iconUrl = await fetchFavicon(url);

    const newIcon: HomeIcon = {
      id: Date.now().toString(),
      name: name.length > 30 ? name.substring(0, 30) + "..." : name,
    // Fetch favicon
    const iconUrl = await fetchFavicon(url);

    const newIcon: HomeIcon = {
      id: Date.now().toString(),
      name: name.length > 30 ? name.substring(0, 30) + "..." : name,
      url,
      iconUrl: iconUrl || undefined,
      folderId: homeData.currentFolderId,
      createdAt: new Date().toISOString(),
      order: homeData.icons.length,
    };
      url,
      iconUrl,
      folderId: homeData.currentFolderId,
      createdAt: new Date().toISOString(),
      order: homeData.icons.length,
    };

    const newData = {
      ...homeData,
      icons: [...homeData.icons, newIcon],
    };
    await saveHomeData(newData);
  };

  // Sample data for testing
  const getSampleIcons = (): HomeIcon[] => [
    {
      id: "1",
      name: "Google",
      url: "https://google.com",
      iconUrl: "https://www.google.com/favicon.ico",
      createdAt: new Date().toISOString(),
      order: 0,
    },
    {
      id: "2",
      name: "GitHub",
      url: "https://github.com",
      iconUrl: "https://github.com/favicon.ico",
      createdAt: new Date().toISOString(),
      order: 1,
    },
    {
      id: "3",
      name: "YouTube",
      url: "https://youtube.com",
      iconUrl: "https://www.youtube.com/favicon.ico",
      createdAt: new Date().toISOString(),
      order: 2,
    },
    {
      id: "4",
      name: "Stack Overflow",
      url: "https://stackoverflow.com",
      iconUrl: "https://stackoverflow.com/favicon.ico",
      createdAt: new Date().toISOString(),
      order: 3,
    },
  ];

  const getSampleFolders = (): Folder[] => [
    {
      id: "1",
      name: "Social",
      createdAt: new Date().toISOString(),
      order: 0,
    },
    {
      id: "2",
      name: "Development",
      createdAt: new Date().toISOString(),
      order: 1,
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
    // Fetch favicon for the new URL
    const iconUrl = await fetchFavicon(newIconUrl);

    const newIcon: HomeIcon = {
      id: Date.now().toString(),
      name: newIconName,
      url: newIconUrl.startsWith("http") ? newIconUrl : `https://${newIconUrl}`,
      iconUrl: iconUrl || undefined,
      folderId: homeData.currentFolderId,
      createdAt: new Date().toISOString(),
      order: homeData.icons.length,
    };

  // Handle icon click
  const handleIconClick = async (icon: HomeIcon) => {
    window.open(icon.url, "_blank");
  };

  // Add new icon with auto-favicon
      iconUrl: iconUrl || undefined,
  const handleAddIcon = async () => {
    if (!newIconName.trim() || !newIconUrl.trim()) return;

    // Fetch favicon for the new URL
    const iconUrl = await fetchFavicon(newIconUrl);

    const newIcon: HomeIcon = {
      id: Date.now().toString(),
      name: newIconName,
      url: newIconUrl.startsWith("http") ? newIconUrl : `https://${newIconUrl}`,
      iconUrl,
      folderId: homeData.currentFolderId,
      createdAt: new Date().toISOString(),
      order: homeData.icons.length,
    };

    const newData = {
      ...homeData,
      icons: [...homeData.icons, newIcon],
    };
    await saveHomeData(newData);
    setIsAddingIcon(false);
    setNewIconName("");
    setNewIconUrl("");
  };

  // Add new folder
  const handleAddFolder = async () => {
    if (!newFolderName.trim()) return;

    const newFolder: Folder = {
      id: Date.now().toString(),
      name: newFolderName,
      parentId: homeData.currentFolderId,
      createdAt: new Date().toISOString(),
      order: homeData.folders.length,
    };

    const newData = {
      ...homeData,
      folders: [...homeData.folders, newFolder],
    };
    await saveHomeData(newData);
    setIsAddingFolder(false);
    setNewFolderName("");
  };

  // Delete icon with confirmation
  const handleDeleteIcon = async (iconId: string) => {
    if (confirm("Are you sure you want to remove this site?")) {
      const newData = {
        ...homeData,
        icons: homeData.icons.filter((icon) => icon.id !== iconId),
      };
      saveHomeData(newData);
    }
  };

  // Delete folder with confirmation and move sites to home
  const handleDeleteFolder = async (folderId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this folder? Sites inside will be moved to the home screen."
      )
    ) {
      const newData = {
        ...homeData,
        folders: homeData.folders.filter((folder) => folder.id !== folderId),
        icons: homeData.icons.map((icon) =>
          icon.folderId === folderId ? { ...icon, folderId: undefined } : icon
        ),
      };
      saveHomeData(newData);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, item: DragItem) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (
    e: React.DragEvent,
    targetIndex: number,
    type: "icon" | "folder"
  ) => {
    e.preventDefault();
    if (!draggedItem) return;

    const isSameType = draggedItem.type === type;
    if (!isSameType) return; // Don't allow mixing types

    let newData = { ...homeData };

    if (type === "icon") {
      const newIcons = [...currentIcons];
      const [movedIcon] = newIcons.splice(draggedItem.index, 1);
      newIcons.splice(targetIndex, 0, movedIcon);

      // Update order property
      newIcons.forEach((icon, index) => {
        icon.order = index;
      });

      newData.icons = homeData.icons.map((icon) => {
        const updatedIcon = newIcons.find((newIcon) => newIcon.id === icon.id);
        return updatedIcon || icon;
      });
    } else {
      const newFolders = [...currentFolders];
      const [movedFolder] = newFolders.splice(draggedItem.index, 1);
      newFolders.splice(targetIndex, 0, movedFolder);

      // Update order property
      newFolders.forEach((folder, index) => {
        folder.order = index;
      });

      newData.folders = homeData.folders.map((folder) => {
        const updatedFolder = newFolders.find(
          (newFolder) => newFolder.id === folder.id
        );
        return updatedFolder || folder;
      });
    }

    await saveHomeData(newData);
    setDraggedItem(null);
  };

  // Get domain icon or fallback icon
  const getIconForUrl = (icon: HomeIcon) => {
    if (icon.iconUrl) {
      return icon.iconUrl;
    }

    try {
      const domain = new URL(icon.url).hostname;
      return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    } catch {
      return null;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background:
          "linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)",
        border: "1px solid rgba(71, 85, 105, 0.6)",
        borderRadius: "1rem",
        overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
      }}
    >
      {/* Enhanced Header */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderBottom: "1px solid rgba(71, 85, 105, 0.4)",
          background: "rgba(30, 41, 59, 0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "20px",
                boxShadow: "0 4px 14px 0 rgba(139, 92, 246, 0.39)",
              }}
            >
              🏠
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  color: "#f1f5f9",
                  letterSpacing: "-0.025em",
                }}
              >
                Home
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  color: "#94a3b8",
                  fontWeight: 500,
                }}
              >
                Quick access to your favorite sites
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            {currentFolder && (
              <button
                onClick={goHome}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "0.75rem",
                  border: "1px solid rgba(71, 85, 105, 0.6)",
                  background: "rgba(15, 23, 42, 0.8)",
                  color: "#e2e8f0",
                  fontSize: "0.8rem",
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(15, 23, 42, 0.9)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(15, 23, 42, 0.8)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                🏠 Home
              </button>
            )}

            <button
              onClick={currentFolder ? goBack : undefined}
              disabled={!currentFolder}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "0.75rem",
                border: "1px solid rgba(71, 85, 105, 0.6)",
                background: currentFolder
                  ? "rgba(15, 23, 42, 0.8)"
                  : "rgba(15, 23, 42, 0.3)",
                color: currentFolder ? "#e2e8f0" : "#64748b",
                fontSize: "0.8rem",
                cursor: currentFolder ? "pointer" : "not-allowed",
                fontWeight: 500,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (currentFolder) {
                  e.currentTarget.style.background = "rgba(15, 23, 42, 0.9)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }
              }}
              onMouseLeave={(e) => {
                if (currentFolder) {
                  e.currentTarget.style.background = "rgba(15, 23, 42, 0.8)";
                  e.currentTarget.style.transform = "translateY(0)";
                }
              }}
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Enhanced Navigation breadcrumb */}
        {currentFolder && (
          <div
            style={{
              fontSize: "0.85rem",
              color: "#94a3b8",
              marginBottom: "0.75rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <span
              style={{ cursor: "pointer", color: "#60a5fa", fontWeight: 500 }}
              onClick={goHome}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "#93c5fd";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "#60a5fa";
              }}
            >
              Home
            </span>
            <span style={{ color: "#64748b" }}>/</span>
            <span style={{ color: "#e2e8f0", fontWeight: 500 }}>
              {currentFolder.name}
            </span>
          </div>
        )}

        {/* Enhanced Search and Add Buttons */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {/* Enhanced Search */}
          <div
            style={{
              position: "relative",
              flex: 1,
              minWidth: "150px",
            }}
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your sites..."
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "0.75rem",
                border: "1px solid rgba(71, 85, 105, 0.6)",
                background: "rgba(15, 23, 42, 0.9)",
                color: "#f1f5f9",
                fontSize: "0.85rem",
                outline: "none",
                transition: "all 0.2s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#8b5cf6";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(139, 92, 246, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(71, 85, 105, 0.6)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#94a3b8",
                  cursor: "pointer",
                  fontSize: "1rem",
                  width: "20px",
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                  e.currentTarget.style.color = "#fca5a5";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "none";
                  e.currentTarget.style.color = "#94a3b8";
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Enhanced Action Buttons */}
          <button
            onClick={addCurrentSite}
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
              border: "1px solid rgba(234, 179, 8, 0.4)",
              background:
                "linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(234, 179, 8, 0.05) 100%)",
              color: "#fbbf24",
              fontSize: "0.8rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontWeight: 500,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(234, 179, 8, 0.25)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(234, 179, 8, 0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            ⭐ Add Current
          </button>

          <button
            onClick={() => setIsAddingIcon(!isAddingIcon)}
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
              border: "1px solid rgba(34, 197, 94, 0.4)",
              background:
                "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)",
              color: "#86efac",
              fontSize: "0.8rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontWeight: 500,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(34, 197, 94, 0.25)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(34, 197, 94, 0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            ➕ Add Site
          </button>

          <button
            onClick={() => setIsAddingFolder(!isAddingFolder)}
            style={{
              padding: "0.75rem 1rem",
              borderRadius: "0.75rem",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              background:
                "linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)",
              color: "#93c5fd",
              fontSize: "0.8rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontWeight: 500,
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.25)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(59, 130, 246, 0.15)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            📁 Add Folder
          </button>
        </div>
      </div>

      {/* Enhanced Add Icon Form */}
      {isAddingIcon && (
        <div
          style={{
            padding: "1.25rem",
            borderBottom: "1px solid rgba(71, 85, 105, 0.4)",
            background: "rgba(30, 41, 59, 0.7)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              value={newIconName}
              onChange={(e) => setNewIconName(e.target.value)}
              placeholder="Site name (e.g., Google)"
              style={{
                flex: 1,
                minWidth: "120px",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(71, 85, 105, 0.6)",
                background: "rgba(15, 23, 42, 0.9)",
                color: "#f1f5f9",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
            <input
              type="text"
              value={newIconUrl}
              onChange={(e) => setNewIconUrl(e.target.value)}
              placeholder="URL (e.g., google.com)"
              style={{
                flex: 1,
                minWidth: "120px",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(71, 85, 105, 0.6)",
                background: "rgba(15, 23, 42, 0.9)",
                color: "#f1f5f9",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
            <button
              onClick={handleAddIcon}
              style={{
                padding: "0.75rem 1.25rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(34, 197, 94, 0.6)",
                background: "rgba(34, 197, 94, 0.2)",
                color: "#86efac",
                fontSize: "0.85rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontWeight: 500,
              }}
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAddingIcon(false);
                setNewIconName("");
                setNewIconUrl("");
              }}
              style={{
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(239, 68, 68, 0.6)",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#fca5a5",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Add Folder Form */}
      {isAddingFolder && (
        <div
          style={{
            padding: "1.25rem",
            borderBottom: "1px solid rgba(71, 85, 105, 0.4)",
            background: "rgba(30, 41, 59, 0.7)",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name (e.g., Work)"
              style={{
                flex: 1,
                minWidth: "120px",
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(71, 85, 105, 0.6)",
                background: "rgba(15, 23, 42, 0.9)",
                color: "#f1f5f9",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
            <button
              onClick={handleAddFolder}
              style={{
                padding: "0.75rem 1.25rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(59, 130, 246, 0.6)",
                background: "rgba(59, 130, 246, 0.2)",
                color: "#93c5fd",
                fontSize: "0.85rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontWeight: 500,
              }}
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAddingFolder(false);
                setNewFolderName("");
              }}
              style={{
                padding: "0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid rgba(239, 68, 68, 0.6)",
                background: "rgba(239, 68, 68, 0.1)",
                color: "#fca5a5",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Content Grid */}
      <div
        style={{
          flex: 1,
          padding: "1.25rem",
          overflowY: "auto",
        }}
      >
        {/* Folders */}
        {currentFolders.length > 0 && (
          <>
            <h3
              style={{
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#94a3b8",
                marginBottom: "1rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              Folders
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: "0.75rem",
                marginBottom: "1.5rem",
              }}
            >
              {currentFolders.map((folder, index) => (
                <div
                  key={folder.id}
                  draggable
                  onDragStart={(e) =>
                    handleDragStart(e, { id: folder.id, type: "folder", index })
                  }
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index, "folder")}
                  onClick={() => navigateToFolder(folder.id)}
                  style={{
                    position: "relative",
                    padding: "1rem 0.75rem",
                    borderRadius: "1rem",
                    border: "1px solid rgba(71, 85, 105, 0.6)",
                    background:
                      "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)",
                    color: "#cbd5f5",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(59, 130, 246, 0.6)";
                    e.currentTarget.style.background = "rgba(30, 41, 59, 0.95)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(71, 85, 105, 0.6)";
                    e.currentTarget.style.background = "rgba(15, 23, 42, 0.9)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFolder(folder.id);
                    }}
                    style={{
                      position: "absolute",
                      top: "0.5rem",
                      right: "0.5rem",
                      width: "20px",
                      height: "20px",
                      borderRadius: "50%",
                      border: "none",
                      background: "rgba(239, 68, 68, 0.9)",
                      color: "white",
                      fontSize: "0.7rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "0";
                    }}
                  >
                    ✕
                  </button>

                  <div
                    style={{
                      fontSize: "1.75rem",
                      filter: "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))",
                    }}
                  >
                    📁
                  </div>
                  <div
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      width: "100%",
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
                fontSize: "0.85rem",
                fontWeight: 700,
                color: "#94a3b8",
                marginBottom: "1rem",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
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
              {filteredIcons.map((icon, index) => (
                <div
                  key={icon.id}
                  draggable
                  onDragStart={(e) =>
                    handleDragStart(e, { id: icon.id, type: "icon", index })
                  }
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index, "icon")}
                  style={{
                    position: "relative",
                    padding: "1rem 0.75rem",
                    borderRadius: "1rem",
                    border: "1px solid rgba(71, 85, 105, 0.6)",
                    background:
                      "linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                  onClick={() => handleIconClick(icon)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(139, 92, 246, 0.6)";
                    e.currentTarget.style.background = "rgba(30, 41, 59, 0.95)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(71, 85, 105, 0.6)";
                    e.currentTarget.style.background = "rgba(15, 23, 42, 0.9)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
                  }}
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
                      background: "rgba(239, 68, 68, 0.9)",
                      color: "white",
                      fontSize: "0.7rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0,
                      transition: "opacity 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.opacity = "1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.opacity = "0";
                    }}
                  >
                    ✕
                  </button>

                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "12px",
                      background:
                        "linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(139, 92, 246, 0.2) 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.25rem",
                      border: "1px solid rgba(59, 130, 246, 0.4)",
                      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    {(() => {
                      const iconUrl = getIconForUrl(icon);
                      if (iconUrl) {
                        return (
                          <img
                            src={iconUrl}
                            alt={icon.name}
                            style={{
                              width: "24px",
                              height: "24px",
                              borderRadius: "6px",
                            }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const fallback =
                                target.nextElementSibling as HTMLElement;
                              if (fallback) {
                                fallback.style.display = "block";
                              }
                            }}
                          />
                        );
                      }
                      return <span>📄</span>;
                    })()}
                    <span style={{ display: "none", fontSize: "1.25rem" }}>
                      {icon.name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  <div
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 600,
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

        {/* Enhanced Empty State */}
        {filteredIcons.length === 0 && currentFolders.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "3rem 2rem",
              color: "#94a3b8",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>
              {searchQuery ? "🔍" : "🏠"}
            </div>
            <div
              style={{
                fontSize: "1.25rem",
                fontWeight: 700,
                marginBottom: "0.75rem",
                color: "#e2e8f0",
              }}
            >
              {searchQuery ? "No sites found" : "Your home is empty"}
            </div>
            <div
              style={{
                fontSize: "1rem",
                marginBottom: "1.5rem",
                color: "#94a3b8",
              }}
            >
              {searchQuery
                ? "Try a different search term"
                : "Add some sites or create folders to get started"}
            </div>
            {!searchQuery && (
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={addCurrentSite}
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(234, 179, 8, 0.4)",
                    background:
                      "linear-gradient(135deg, rgba(234, 179, 8, 0.15) 0%, rgba(234, 179, 8, 0.05) 100%)",
                    color: "#fbbf24",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(234, 179, 8, 0.25)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(234, 179, 8, 0.15)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  ⭐ Add Current Site
                </button>
                <button
                  onClick={() => setIsAddingIcon(true)}
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "0.75rem",
                    border: "1px solid rgba(34, 197, 94, 0.4)",
                    background:
                      "linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)",
                    color: "#86efac",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    fontWeight: 500,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(34, 197, 94, 0.25)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(34, 197, 94, 0.15)";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  ➕ Add Manual Site
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
