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
  isFolder?: boolean; // For combined display
  folderName?: string; // For folder items
}

export interface HomeData {
  icons: HomeIcon[];
  currentFolderId?: string;
}

interface HomeTabProps {
  // Home tab is self-contained, no props needed
}

// Drag and drop types
interface DragItem {
  id: string;
  index: number;
  isFolder: boolean;
}

const HomeTab: React.FC<HomeTabProps> = () => {
  const [homeData, setHomeData] = useState<HomeData>({
    icons: [],
    currentFolderId: undefined,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddingIcon, setIsAddingIcon] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [addMenuType, setAddMenuType] = useState<
    "current" | "custom" | "folder" | null
  >(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemUrl, setNewItemUrl] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
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
          icons: getSampleData(),
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

    // Check for duplicates (case-insensitive URL comparison)
    const isDuplicate = homeData.icons.some(
      (icon) => icon.url.toLowerCase() === url.toLowerCase()
    );

    if (isDuplicate) {
      alert("This website is already added to your home screen!");
      return;
    }

    // Fetch favicon
    const iconUrl = await fetchFavicon(url);

    const newIcon: HomeIcon = {
      id: Date.now().toString(),
      name: name.length > 30 ? name.substring(0, 30) + "..." : name,
      url,
      iconUrl: iconUrl || undefined,
      folderId: homeData.currentFolderId,
      createdAt: new Date().toISOString(),
      order: getCurrentItems().length,
      isFolder: false,
    };

    const newData = {
      ...homeData,
      icons: [...homeData.icons, newIcon],
    };
    await saveHomeData(newData);
  };

  // Create new folder
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;

    const folderId = `folder-${Date.now().toString()}`;
    const newFolder: HomeIcon = {
      id: folderId,
      name: newFolderName.trim(),
      url: "#",
      iconUrl: undefined,
      folderId: homeData.currentFolderId,
      createdAt: new Date().toISOString(),
      order: getCurrentItems().length,
      isFolder: true,
    };

    const newData = {
      ...homeData,
      icons: [...homeData.icons, newFolder],
    };

    await saveHomeData(newData);
    setIsAddMenuOpen(false);
    setAddMenuType(null);
    setNewFolderName("");
  };

  // Handle plus button menu
  const handlePlusMenu = (type: "current" | "custom" | "folder") => {
    setAddMenuType(type);
    if (type === "current") {
      addCurrentSite();
      setIsAddMenuOpen(false);
    } else {
      setIsAddingIcon(type === "custom");
    }
  };

  // Sample data for testing
  const getSampleData = (): HomeIcon[] => [
    {
      id: "folder-1",
      name: "Social",
      url: "#",
      iconUrl: undefined,
      createdAt: new Date().toISOString(),
      order: 0,
      isFolder: true,
    },
    {
      id: "1",
      name: "Google",
      url: "https://google.com",
      iconUrl: "https://www.google.com/favicon.ico",
      createdAt: new Date().toISOString(),
      order: 1,
      isFolder: false,
    },
    {
      id: "2",
      name: "GitHub",
      url: "https://github.com",
      iconUrl: "https://github.com/favicon.ico",
      createdAt: new Date().toISOString(),
      order: 2,
      isFolder: false,
    },
    {
      id: "3",
      name: "YouTube",
      url: "https://youtube.com",
      iconUrl: "https://www.youtube.com/favicon.ico",
      createdAt: new Date().toISOString(),
      order: 3,
      folderId: "folder-1",
      isFolder: false,
    },
    {
      id: "4",
      name: "Stack Overflow",
      url: "https://stackoverflow.com",
      iconUrl: "https://stackoverflow.com/favicon.ico",
      createdAt: new Date().toISOString(),
      order: 4,
      isFolder: false,
    },
  ];

  // Get current folder (for single-layer navigation only)
  const getCurrentFolder = () => {
    if (!homeData.currentFolderId) return null;
    return homeData.icons.find((item) => item.id === homeData.currentFolderId);
  };

  // Get all items for current view (both regular icons and folders)
  const getCurrentItems = () => {
    const currentFolderId = homeData.currentFolderId;

    let allItems: HomeIcon[] = [];

    if (!currentFolderId) {
      // Show folders and icons not in any folder
      allItems = homeData.icons.filter((item) => !item.folderId);
    } else {
      // Show items in current folder
      allItems = homeData.icons.filter(
        (item) => item.folderId === currentFolderId
      );
    }

    // Sort by order: folders first, then sites
    return allItems.sort((a, b) => {
      // Folders first
      if (a.isFolder && !b.isFolder) return -1;
      if (!a.isFolder && b.isFolder) return 1;

      // Both same type, sort by order
      return (a.order || 0) - (b.order || 0);
    });
  };

  // Filter items by search query
  const filteredItems = searchQuery
    ? getCurrentItems().filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.url.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : getCurrentItems();

  // Navigation (simplified)
  const openFolder = (folderId: string) => {
    const newData = {
      ...homeData,
      currentFolderId: folderId,
    };
    saveHomeData(newData);
  };

  const goBack = () => {
    const newData = {
      ...homeData,
      currentFolderId: undefined,
    };
    saveHomeData(newData);
  };

  // Handle item click (open website or navigate to folder)
  const handleItemClick = async (item: HomeIcon) => {
    if (item.isFolder) {
      openFolder(item.id);
    } else {
      window.open(item.url, "_blank");
    }
  };

  // Add new regular icon
  const handleAddIcon = async () => {
    if (!newItemName.trim() || !newItemUrl.trim()) return;

    // Check for duplicates (case-insensitive URL comparison)
    const normalizedUrl = newItemUrl.startsWith("http")
      ? newItemUrl
      : `https://${newItemUrl}`;
    const isDuplicate = homeData.icons.some(
      (icon) => icon.url.toLowerCase() === normalizedUrl.toLowerCase()
    );

    if (isDuplicate) {
      alert("This website is already added to your home screen!");
      return;
    }

    // Fetch favicon for the new URL
    const iconUrl = await fetchFavicon(newItemUrl);

    const newIcon: HomeIcon = {
      id: Date.now().toString(),
      name: newItemName,
      url: normalizedUrl,
      iconUrl: iconUrl || undefined,
      folderId: homeData.currentFolderId,
      createdAt: new Date().toISOString(),
      order: getCurrentItems().length,
      isFolder: false,
    };

    const newData = {
      ...homeData,
      icons: [...homeData.icons, newIcon],
    };
    await saveHomeData(newData);
    setIsAddingIcon(false);
    setNewItemName("");
    setNewItemUrl("");
  };

  // Delete item with confirmation
  const handleDeleteItem = async (itemId: string) => {
    const item = homeData.icons.find((i) => i.id === itemId);
    const isFolder = item?.isFolder;

    if (isFolder) {
      if (
        confirm(
          "Delete this folder? All items inside will be moved to the main screen."
        )
      ) {
        const newData = {
          ...homeData,
          icons: homeData.icons
            .filter((icon) => icon.id !== itemId && icon.folderId !== itemId)
            .map((icon) =>
              icon.folderId === itemId ? { ...icon, folderId: undefined } : icon
            ),
        };
        saveHomeData(newData);
      }
    } else {
      if (confirm("Remove this site from your home screen?")) {
        const newData = {
          ...homeData,
          icons: homeData.icons.filter((icon) => icon.id !== itemId),
        };
        saveHomeData(newData);
      }
    }
  };

  // Enhanced drag and drop handlers
  const handleDragStart = (
    e: React.DragEvent,
    item: HomeIcon,
    index: number
  ) => {
    setDraggedItem({ id: item.id, index, isFolder: item.isFolder || false });
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  // Auto-create folder when dropping one icon on another
  const createFolderFromIcons = async (icon1: HomeIcon, icon2: HomeIcon) => {
    const folderId = `folder-${Date.now().toString()}`;
    const folderName = `${icon1.name.split(" ")[0]} & ${
      icon2.name.split(" ")[0]
    }`;

    const newData = {
      ...homeData,
      icons: homeData.icons.map((icon) => {
        if (icon.id === icon1.id || icon.id === icon2.id) {
          return {
            ...icon,
            folderId,
            order: undefined, // Remove order when in folder
          };
        }
        return icon;
      }),
    };

    // Add the folder icon
    newData.icons.push({
      id: folderId,
      name: folderName,
      url: "#",
      iconUrl: undefined,
      folderId: homeData.currentFolderId,
      createdAt: new Date().toISOString(),
      order: getCurrentItems().length,
      isFolder: true,
    });

    await saveHomeData(newData);
  };

  const handleDrop = async (
    e: React.DragEvent,
    targetIndex: number,
    targetItem: HomeIcon
  ) => {
    e.preventDefault();
    setDragOverIndex(null);

    if (!draggedItem) return;

    // Check if we have access to the dragged item
    const draggedIcon = homeData.icons.find(
      (item) => item.id === draggedItem.id
    );
    if (!draggedIcon) return;

    const isDraggedFromMain = !draggedIcon.folderId;
    const isTargetInMain = !homeData.currentFolderId;
    const isTargetSameLevel = draggedIcon.folderId === homeData.currentFolderId;

    // Case 1: Dropping onto a folder (prevent folder-in-folder)
    if (targetItem.isFolder && draggedItem.id !== targetItem.id) {
      // Only allow moving non-folders from main level into folders
      if (!draggedIcon.isFolder && isDraggedFromMain && isTargetInMain) {
        const newData = {
          ...homeData,
          icons: homeData.icons.map((icon) =>
            icon.id === draggedItem.id
              ? { ...icon, folderId: targetItem.id, order: undefined }
              : icon
          ),
        };
        await saveHomeData(newData);
      }
      // Otherwise ignore (prevent folders in folders, or moving from folder to main)
    }
    // Case 2: Auto-create folder when dropping different items together
    else if (draggedItem.id !== targetItem.id && isTargetSameLevel) {
      // Only create folders when both items are at the same level and neither is a folder
      if (!draggedIcon.isFolder && !targetItem.isFolder) {
        await createFolderFromIcons(draggedIcon, targetItem);
      }
    }
    // Case 3: Reorder within current view (improved logic)
    else if (isTargetSameLevel) {
      // Get current items in the correct order
      const currentItems = getCurrentItems();

      // Find the dragged item in current items
      const draggedItemIndex = currentItems.findIndex(
        (item) => item.id === draggedItem.id
      );
      if (draggedItemIndex === -1) {
        console.warn("Dragged item not found in current items");
        return;
      }

      // If dropping on the same position, no need to reorder
      if (draggedItemIndex === targetIndex) {
        return;
      }

      // Create new array with the dragged item removed and inserted at new position
      const newItems = [...currentItems];
      const [removedItem] = newItems.splice(draggedItemIndex, 1);

      // Adjust target index if dragging forward
      const adjustedTargetIndex =
        draggedItemIndex < targetIndex ? targetIndex - 1 : targetIndex;
      newItems.splice(adjustedTargetIndex, 0, removedItem);

      // Update order for all items in the current view
      const orderUpdates: Record<string, number> = {};
      newItems.forEach((item, index) => {
        orderUpdates[item.id] = index;
      });

      // Apply the order updates to the main icons array
      const newData = {
        ...homeData,
        icons: homeData.icons.map((icon) => {
          if (orderUpdates.hasOwnProperty(icon.id)) {
            return { ...icon, order: orderUpdates[icon.id] };
          }
          return icon;
        }),
      };
      await saveHomeData(newData);
    }

    setDraggedItem(null);
  };

  // Get domain icon or fallback icon
  const getIconForItem = (item: HomeIcon) => {
    if (item.isFolder) return "📁";

    if (item.iconUrl) {
      return item.iconUrl;
    }

    try {
      const domain = new URL(item.url).hostname;
      return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    } catch {
      return "📄";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "rgba(15, 23, 42, 0.95)",
        borderRadius: "1rem",
        overflow: "hidden",
        boxShadow: "0 24px 45px -18px rgba(0,0,0,0.65)",
        position: "relative",
      }}
    >
      {/* Enhanced Header */}
      <div
        style={{
          padding: "0.875rem",
          borderBottom: "1px solid rgba(51,65,85,0.4)",
          background: "rgba(30,41,59,0.95)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.875rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1.25rem",
              }}
            >
              <div
                style={{
                  width: "44px",
                  height: "44px",
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, #8b5cf6 0%, #a855f7 30%, #ec4899 70%, #f97316 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: "20px",
                  boxShadow: "0 8px 25px rgba(139, 92, 246, 0.35)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)",
                    animation: "shimmer 3s infinite",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background:
                      "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2) 0%, transparent 50%)",
                  }}
                />
                🏠
              </div>
              <div>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 900,
                    background:
                      "linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    letterSpacing: "-0.02em",
                    marginBottom: "0.25rem",
                  }}
                >
                  Home
                </div>
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#a1a1aa",
                    fontWeight: 500,
                    letterSpacing: "0.025em",
                  }}
                >
                  Your personal app launcher
                </div>
              </div>
            </div>

            <div
              style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
            >
              {/* Big Plus Button in Top Right */}
              <button
                onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
                style={{
                  padding: "0.75rem 1.25rem",
                  borderRadius: "16px",
                  border: "2px solid rgba(34, 197, 94, 0.4)",
                  background:
                    "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15))",
                  color: "#86efac",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontWeight: 700,
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  boxShadow: "0 4px 12px rgba(34, 197, 94, 0.25)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(16, 185, 129, 0.25))";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(34, 197, 94, 0.35)";
                  e.currentTarget.style.borderColor = "rgba(34, 197, 94, 0.6)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15))";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(34, 197, 94, 0.25)";
                  e.currentTarget.style.borderColor = "rgba(34, 197, 94, 0.4)";
                }}
              >
                <span style={{ fontSize: "1.2rem", fontWeight: 900 }}>+</span>
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Top Row: Compact Search Bar */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
            }}
          >
            {/* Search Bar - enhanced styling */}
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
                placeholder="Search your apps..."
                style={{
                  width: "100%",
                  padding: "0.6rem 0.8rem 0.6rem 2.2rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  background: "rgba(15, 23, 42, 0.9)",
                  color: "#f1f5f9",
                  fontSize: "0.8rem",
                  outline: "none",
                  transition: "all 0.2s ease",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#8b5cf6";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(139, 92, 246, 0.15), 0 3px 8px rgba(0, 0, 0, 0.18)";
                  e.currentTarget.style.background = "rgba(15, 23, 42, 0.95)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.3)";
                  e.currentTarget.style.boxShadow =
                    "0 2px 6px rgba(0, 0, 0, 0.12)";
                  e.currentTarget.style.background = "rgba(15, 23, 42, 0.9)";
                }}
              />
              <div
                style={{
                  position: "absolute",
                  left: "0.6rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#94a3b8",
                  fontSize: "0.9rem",
                  pointerEvents: "none",
                }}
              >
                🔍
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "0.6rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid rgba(239, 68, 68, 0.4)",
                    color: "#fca5a5",
                    cursor: "pointer",
                    fontSize: "0.7rem",
                    width: "20px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Menu Dropdown - positioned relative to header button */}
      {isAddMenuOpen && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 0.5rem)",
            right: "0.875rem",
            background: "rgba(30, 41, 59, 0.98)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            borderRadius: "12px",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.4)",
            zIndex: 1000,
            padding: "0.5rem",
            minWidth: "160px",
            backdropFilter: "blur(20px)",
          }}
          onMouseLeave={() => setIsAddMenuOpen(false)}
        >
          <button
            onClick={() => handlePlusMenu("current")}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              border: "none",
              background: "transparent",
              color: "#fbbf24",
              fontSize: "0.8rem",
              fontWeight: 600,
              textAlign: "left",
              cursor: "pointer",
              borderRadius: "8px",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(234, 179, 8, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span>⭐</span>
            Add Current Site
          </button>
          <button
            onClick={() => handlePlusMenu("custom")}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              border: "none",
              background: "transparent",
              color: "#86efac",
              fontSize: "0.8rem",
              fontWeight: 600,
              textAlign: "left",
              cursor: "pointer",
              borderRadius: "8px",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(34, 197, 94, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span>🌐</span>
            Add Custom Site
          </button>
          <button
            onClick={() => handlePlusMenu("folder")}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              border: "none",
              background: "transparent",
              color: "#60a5fa",
              fontSize: "0.8rem",
              fontWeight: 600,
              textAlign: "left",
              cursor: "pointer",
              borderRadius: "8px",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(96, 165, 250, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span>📁</span>
            Create Folder
          </button>
        </div>
      )}

      {/* Back to Home Button - appears below search when in folder */}
      {getCurrentFolder() && (
        <div
          style={{
            padding: "0.75rem 1rem",
            borderBottom: "1px solid rgba(51,65,85,0.4)",
            background: "rgba(30,41,59,0.95)",
          }}
        >
          <div
            onDragOver={(e) => {
              if (draggedItem && draggedItem.isFolder === false) {
                e.preventDefault();
                e.currentTarget.style.background =
                  "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(59, 130, 246, 0.2))";
                e.currentTarget.style.transform = "translateY(-1px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(34, 197, 94, 0.25)";
              }
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15))";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 6px rgba(0, 0, 0, 0.15)";
            }}
            onDrop={async (e) => {
              if (draggedItem && draggedItem.isFolder === false) {
                e.preventDefault();
                // Move dragged item back to main level
                const newData = {
                  ...homeData,
                  currentFolderId: undefined,
                  icons: homeData.icons.map((icon) =>
                    icon.id === draggedItem.id
                      ? {
                          ...icon,
                          folderId: undefined,
                          order: getCurrentItems().length,
                        }
                      : icon
                  ),
                };
                await saveHomeData(newData);
                setDraggedItem(null);
              }
            }}
            onClick={goBack}
            style={{
              background:
                "linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(16, 185, 129, 0.08))",
              border: "2px solid rgba(34, 197, 94, 0.3)",
              borderRadius: "0px",
              padding: "1.25rem 1.5rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              transition: "all 0.3s ease",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.9rem",
              boxShadow:
                "0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
              textAlign: "center",
              width: "100%",
              position: "relative",
              overflow: "hidden",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, rgba(34, 197, 94, 0.18), rgba(16, 185, 129, 0.12))";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 20px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(16, 185, 129, 0.08))";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)";
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "0px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.2)",
              }}
            >
              ←
            </div>
            <div style={{ textAlign: "left" }}>
              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: 800,
                  letterSpacing: "0.5px",
                }}
              >
                Back to Home
              </div>
              <div
                style={{ fontSize: "0.8rem", opacity: 0.9, fontWeight: 500 }}
              >
                Drop icons here to move them back
              </div>
            </div>
            <div
              style={{
                position: "absolute",
                right: "1rem",
                top: "50%",
                transform: "translateY(-50%)",
                width: "2px",
                height: "60%",
                background:
                  "linear-gradient(to bottom, transparent, rgba(34, 197, 94, 0.3), transparent)",
              }}
            />
          </div>
        </div>
      )}

      {/* Enhanced Add Form */}
      {isAddingIcon && (
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid rgba(139, 92, 246, 0.2)",
            background: "rgba(30, 41, 59, 0.9)",
            backdropFilter: "blur(15px)",
            margin: "0 1rem",
            borderRadius: "16px",
            marginTop: "1rem",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {/* Site Name - First Field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#94a3b8",
                  marginBottom: "0.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Site Name
              </label>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="Enter site name (e.g., Google)"
                style={{
                  width: "100%",
                  padding: "0.9rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  background: "rgba(15, 23, 42, 0.95)",
                  color: "#f1f5f9",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "all 0.3s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#8b5cf6";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(139, 92, 246, 0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.3)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Site URL - Second Field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#94a3b8",
                  marginBottom: "0.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Site URL
              </label>
              <input
                type="text"
                value={newItemUrl}
                onChange={(e) => setNewItemUrl(e.target.value)}
                placeholder="Enter URL (e.g., google.com)"
                style={{
                  width: "100%",
                  padding: "0.9rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  background: "rgba(15, 23, 42, 0.95)",
                  color: "#f1f5f9",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "all 0.3s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#8b5cf6";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(139, 92, 246, 0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.3)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Icon URL - Third Field */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#94a3b8",
                  marginBottom: "0.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Icon URL (Optional)
              </label>
              <input
                type="text"
                placeholder="Icon URL (optional - will auto-fetch if empty)"
                style={{
                  width: "100%",
                  padding: "0.9rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(139, 92, 246, 0.2)",
                  background: "rgba(15, 23, 42, 0.95)",
                  color: "#f1f5f9",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "all 0.3s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#8b5cf6";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(139, 92, 246, 0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.2)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "space-between",
                marginTop: "0.5rem",
              }}
            >
              <button
                onClick={() => {
                  setIsAddingIcon(false);
                  setNewItemName("");
                  setNewItemUrl("");
                }}
                style={{
                  flex: 1,
                  padding: "0.9rem 1.5rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#fca5a5",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Cancel
              </button>
              {addMenuType === "custom" ? (
                <button
                  onClick={handleAddIcon}
                  style={{
                    flex: 1,
                    padding: "0.9rem 1.5rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(34, 197, 94, 0.6)",
                    background: "rgba(34, 197, 94, 0.2)",
                    color: "#86efac",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(34, 197, 94, 0.3)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(34, 197, 94, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(34, 197, 94, 0.2)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Add Site
                </button>
              ) : (
                <button
                  onClick={handleCreateFolder}
                  style={{
                    flex: 1,
                    padding: "0.9rem 1.5rem",
                    borderRadius: "12px",
                    border: "1px solid rgba(96, 165, 250, 0.6)",
                    background: "rgba(96, 165, 250, 0.2)",
                    color: "#60a5fa",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(96, 165, 250, 0.3)";
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(96, 165, 250, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "rgba(96, 165, 250, 0.2)";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  Create Folder
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Folder Creation Form */}
      {addMenuType === "folder" && (
        <div
          style={{
            padding: "1.5rem",
            borderBottom: "1px solid rgba(139, 92, 246, 0.2)",
            background: "rgba(30, 41, 59, 0.9)",
            backdropFilter: "blur(15px)",
            margin: "0 1rem",
            borderRadius: "16px",
            marginTop: "1rem",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {/* Folder Name */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#94a3b8",
                  marginBottom: "0.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Folder Name
              </label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Enter folder name (e.g., Work, Social, etc.)"
                style={{
                  width: "100%",
                  padding: "0.9rem 1rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(96, 165, 250, 0.3)",
                  background: "rgba(15, 23, 42, 0.95)",
                  color: "#f1f5f9",
                  fontSize: "0.9rem",
                  outline: "none",
                  transition: "all 0.3s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#60a5fa";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 3px rgba(96, 165, 250, 0.15)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(96, 165, 250, 0.3)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                justifyContent: "space-between",
                marginTop: "0.5rem",
              }}
            >
              <button
                onClick={() => {
                  setIsAddingIcon(false);
                  setAddMenuType(null);
                  setNewFolderName("");
                }}
                style={{
                  flex: 1,
                  padding: "0.9rem 1.5rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  background: "rgba(239, 68, 68, 0.1)",
                  color: "#fca5a5",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateFolder}
                style={{
                  flex: 1,
                  padding: "0.9rem 1.5rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(96, 165, 250, 0.6)",
                  background: "rgba(96, 165, 250, 0.2)",
                  color: "#60a5fa",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(96, 165, 250, 0.3)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(96, 165, 250, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(96, 165, 250, 0.2)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Create Folder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile-like App Grid */}
      <div
        style={{
          flex: 1,
          padding: "1rem",
          overflowY: "auto",
          paddingBottom: "1rem",
        }}
      >
        {filteredItems.length > 0 || true ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "0.25rem",
              justifyItems: "center",
              padding: "0.5rem",
              position: "relative",
            }}
          >
            {filteredItems.map((item, index) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e) => handleDragStart(e, item, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index, item)}
                onClick={() => handleItemClick(item)}
                style={{
                  position: "relative",
                  width: "100%",
                  maxWidth: "52px",
                  padding: "0.25rem",
                  borderRadius: "4px",
                  overflow: "hidden",
                  background:
                    dragOverIndex === index
                      ? "rgba(255, 255, 255, 0.08)"
                      : "transparent",
                  color: "#ffffff",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.125rem",
                }}
                onMouseEnter={(e) => {
                  if (dragOverIndex !== index) {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.03)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (dragOverIndex !== index) {
                    e.currentTarget.style.background = "transparent";
                  }
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteItem(item.id);
                  }}
                  style={{
                    position: "absolute",
                    top: "1px",
                    right: "1px",
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(239, 68, 68, 0.9)",
                    color: "white",
                    fontSize: "0.45rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.15s ease",
                    zIndex: 1,
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
                    width: "32px",
                    height: "32px",
                    borderRadius: "4px",
                    background: item.isFolder
                      ? "linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(139, 92, 246, 0.25))"
                      : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "14px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {item.isFolder ? (
                    <span style={{ fontSize: "16px" }}>📁</span>
                  ) : (
                    (() => {
                      const iconUrl = getIconForItem(item);
                      if (
                        typeof iconUrl === "string" &&
                        iconUrl.startsWith("http")
                      ) {
                        return (
                          <img
                            src={iconUrl}
                            alt={item.name}
                            style={{
                              width: "32px",
                              height: "32px",
                              borderRadius: "4px",
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
                      return (
                        <span style={{ fontSize: "16px" }}>{iconUrl}</span>
                      );
                    })()
                  )}
                  <span style={{ display: "none", fontSize: "16px" }}>
                    {item.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: "0.55rem",
                    fontWeight: 500,
                    color: "#ffffff",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "normal",
                    width: "100%",
                    textAlign: "center",
                    lineHeight: "1.1",
                    height: "2.2em",
                    maxWidth: "50px",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {item.name.length > 12
                    ? item.name.substring(0, 12) + "..."
                    : item.name}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              color: "#94a3b8",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "2rem" }}>
              {searchQuery ? "🔍" : "🏠"}
            </div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "1rem",
                color: "#e2e8f0",
              }}
            >
              {searchQuery ? "No apps found" : "Your home is empty"}
            </div>
            <div
              style={{
                fontSize: "1rem",
                marginBottom: "2rem",
                color: "#94a3b8",
              }}
            >
              {searchQuery
                ? "Try a different search term"
                : "Tap the + button in the header to start adding your apps"}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default HomeTab;
