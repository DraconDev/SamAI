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
  const [newItemName, setNewItemName] = useState("");
  const [newItemUrl, setNewItemUrl] = useState("");
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

  // Sample data for testing
  const getSampleData = (): HomeIcon[] => [
    {
      id: "1",
      name: "Google",
      url: "https://google.com",
      iconUrl: "https://www.google.com/favicon.ico",
      createdAt: new Date().toISOString(),
      order: 0,
      isFolder: false,
    },
    {
      id: "2",
      name: "GitHub",
      url: "https://github.com",
      iconUrl: "https://github.com/favicon.ico",
      createdAt: new Date().toISOString(),
      order: 1,
      isFolder: false,
    },
    {
      id: "folder-1",
      name: "Social",
      url: "#",
      iconUrl: undefined,
      createdAt: new Date().toISOString(),
      order: 2,
      isFolder: true,
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

    // Sort by order
    return allItems.sort((a, b) => (a.order || 0) - (b.order || 0));
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
    // Case 3: Reorder within current view
    else if (draggedItem.id !== targetItem.id && isTargetSameLevel) {
      // Reorder within current level
      const currentItems = getCurrentItems();
      const draggedIconInCurrent = currentItems[draggedItem.index];

      if (!draggedIconInCurrent || draggedIconInCurrent.id !== draggedItem.id) {
        console.warn("Dragged item not found in current items");
        return;
      }

      const newItems = [...currentItems];
      newItems.splice(draggedItem.index, 1);
      newItems.splice(targetIndex, 0, draggedIconInCurrent);

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
        background: `
          radial-gradient(ellipse at top, rgba(139, 92, 246, 0.15) 0%, transparent 70%),
          radial-gradient(ellipse at bottom, rgba(59, 130, 246, 0.15) 0%, transparent 70%),
          linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 50%, rgba(15, 23, 42, 0.95) 100%)
        `,
        borderRadius: "1rem",
        overflow: "hidden",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)",
        position: "relative",
      }}
    >
      {/* Enhanced Header */}
      <div
        style={{
          padding: "1rem 1.25rem",
          borderBottom: "1px solid rgba(139, 92, 246, 0.2)",
          background: "rgba(30, 41, 59, 0.95)",
          backdropFilter: "blur(15px)",
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
                width: "44px",
                height: "44px",
                borderRadius: "16px",
                background:
                  "linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #ec4899 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: "22px",
                boxShadow: "0 8px 32px rgba(139, 92, 246, 0.4)",
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
                    "linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.2) 50%, transparent 70%)",
                  animation: "shimmer 2s infinite",
                }}
              />
              🏠
            </div>
            <div>
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  background: "linear-gradient(135deg, #f1f5f9, #94a3b8)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
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
                Your personal app launcher
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            {/* Add Current - moved to top right corner */}
            <button
              onClick={addCurrentSite}
              style={{
                padding: "0.6rem 1rem",
                borderRadius: "12px",
                border: "1px solid rgba(234, 179, 8, 0.4)",
                background:
                  "linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05))",
                color: "#fbbf24",
                fontSize: "0.8rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontWeight: 600,
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, rgba(234, 179, 8, 0.25), rgba(234, 179, 8, 0.15))";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 25px rgba(234, 179, 8, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  "linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05))";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              ⭐ Add Current
            </button>
          </div>
        </div>

        {/* Top Row: Search Bar and Add Site */}
        <div
          style={{
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
            marginBottom: "1rem",
          }}
        >
          {/* Search Bar - takes remaining space */}
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
                padding: "0.8rem 1rem 0.8rem 2.5rem",
                borderRadius: "16px",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                background: "rgba(15, 23, 42, 0.8)",
                color: "#f1f5f9",
                fontSize: "0.85rem",
                outline: "none",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#8b5cf6";
                e.currentTarget.style.boxShadow =
                  "0 0 0 4px rgba(139, 92, 246, 0.15)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.3)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#94a3b8",
                fontSize: "1rem",
              }}
            >
              🔍
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "rgba(239, 68, 68, 0.2)",
                  border: "1px solid rgba(239, 68, 68, 0.4)",
                  color: "#fca5a5",
                  cursor: "pointer",
                  fontSize: "0.8rem",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "50%",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
                }}
              >
                ✕
              </button>
            )}
          </div>

          {/* Add Site - moved to top row where Add Current was */}
          <button
            onClick={() => setIsAddingIcon(!isAddingIcon)}
            style={{
              padding: "0.8rem 1.25rem",
              borderRadius: "12px",
              border: "1px solid rgba(34, 197, 94, 0.4)",
              background:
                "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))",
              color: "#86efac",
              fontSize: "0.8rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
              fontWeight: 600,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(34, 197, 94, 0.15))";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 25px rgba(34, 197, 94, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            ➕ Add Site
          </button>
        </div>
      </div>

      {/* Enhanced Add Form */}
      {isAddingIcon && (
        <div
          style={{
            padding: "1.25rem",
            borderBottom: "1px solid rgba(139, 92, 246, 0.2)",
            background: "rgba(30, 41, 59, 0.8)",
            backdropFilter: "blur(10px)",
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
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Site name (e.g., Google)"
              style={{
                flex: 1,
                minWidth: "120px",
                padding: "0.8rem",
                borderRadius: "12px",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                background: "rgba(15, 23, 42, 0.9)",
                color: "#f1f5f9",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
            <input
              type="text"
              value={newItemUrl}
              onChange={(e) => setNewItemUrl(e.target.value)}
              placeholder="URL (e.g., google.com)"
              style={{
                flex: 1,
                minWidth: "120px",
                padding: "0.8rem",
                borderRadius: "12px",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                background: "rgba(15, 23, 42, 0.9)",
                color: "#f1f5f9",
                fontSize: "0.85rem",
                outline: "none",
              }}
            />
            <button
              onClick={handleAddIcon}
              style={{
                padding: "0.8rem 1.25rem",
                borderRadius: "12px",
                border: "1px solid rgba(34, 197, 94, 0.6)",
                background: "rgba(34, 197, 94, 0.2)",
                color: "#86efac",
                fontSize: "0.85rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                fontWeight: 600,
                transition: "all 0.2s ease",
              }}
            >
              Add Site
            </button>
            <button
              onClick={() => {
                setIsAddingIcon(false);
                setNewItemName("");
                setNewItemUrl("");
              }}
              style={{
                padding: "0.8rem",
                borderRadius: "12px",
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

      {/* Mobile-like App Grid */}
      <div
        style={{
          flex: 1,
          padding: "1.5rem",
          overflowY: "auto",
          paddingBottom: getCurrentFolder() ? "1rem" : "1.5rem",
        }}
      >
        {filteredItems.length > 0 ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(5, 1fr)",
              gap: "1rem",
              justifyItems: "center",
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
                  maxWidth: "60px",
                  padding: "0.25rem",
                  borderRadius: "8px",
                  background:
                    dragOverIndex === index
                      ? "rgba(255, 255, 255, 0.1)"
                      : "transparent",
                  color: "#ffffff",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
                onMouseEnter={(e) => {
                  if (dragOverIndex !== index) {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.05)";
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
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    border: "none",
                    background: "rgba(239, 68, 68, 0.9)",
                    color: "white",
                    fontSize: "0.5rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    opacity: 0,
                    transition: "opacity 0.2s ease",
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
                    width: "48px",
                    height: "48px",
                    borderRadius: "10px",
                    background: item.isFolder
                      ? "linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))"
                      : "transparent",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "20px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {item.isFolder ? (
                    <span style={{ fontSize: "24px" }}>📁</span>
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
                              width: "48px",
                              height: "48px",
                              borderRadius: "10px",
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
                        <span style={{ fontSize: "24px" }}>{iconUrl}</span>
                      );
                    })()
                  )}
                  <span style={{ display: "none", fontSize: "24px" }}>
                    {item.name.charAt(0).toUpperCase()}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: "#ffffff",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    width: "100%",
                    textAlign: "center",
                    lineHeight: "1.2",
                    maxWidth: "55px",
                  }}
                >
                  {item.name}
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
                : "Drag apps together to create folders, or add individual sites"}
            </div>
            {!searchQuery && (
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <button
                  onClick={addCurrentSite}
                  style={{
                    padding: "1rem 2rem",
                    borderRadius: "16px",
                    border: "1px solid rgba(234, 179, 8, 0.4)",
                    background:
                      "linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05))",
                    color: "#fbbf24",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, rgba(234, 179, 8, 0.25), rgba(234, 179, 8, 0.15))";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(234, 179, 8, 0.05))";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  ⭐ Add Current Site
                </button>
                <button
                  onClick={() => setIsAddingIcon(true)}
                  style={{
                    padding: "1rem 2rem",
                    borderRadius: "16px",
                    border: "1px solid rgba(34, 197, 94, 0.4)",
                    background:
                      "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))",
                    color: "#86efac",
                    fontSize: "0.9rem",
                    cursor: "pointer",
                    fontWeight: 600,
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(34, 197, 94, 0.15))";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background =
                      "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  ➕ Add Site
                </button>
              </div>
            )}
          </div>
        )}

        {/* Back to Home Button - appears when in folder, after grid */}
        {getCurrentFolder() && filteredItems.length > 0 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "1rem",
            }}
          >
            <div
              onDragOver={(e) => {
                if (draggedItem && draggedItem.isFolder === false) {
                  e.preventDefault();
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(59, 130, 246, 0.3))";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 25px rgba(34, 197, 94, 0.4)";
                }
              }}
              onDragLeave={(e) => {
                if (!draggedItem) {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }
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
                  draggedItem && draggedItem.isFolder === false
                    ? "linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(59, 130, 246, 0.3))"
                    : "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))",
                border: "2px solid rgba(139, 92, 246, 0.4)",
                borderRadius: "16px",
                padding: "1.5rem 2rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                transition: "all 0.3s ease",
                color: "#ffffff",
                fontWeight: 600,
                fontSize: "0.9rem",
                transform:
                  draggedItem && draggedItem.isFolder === false
                    ? "translateY(-2px)"
                    : "translateY(0)",
                boxShadow:
                  draggedItem && draggedItem.isFolder === false
                    ? "0 8px 25px rgba(34, 197, 94, 0.4)"
                    : "0 4px 12px rgba(0, 0, 0, 0.2)",
                textAlign: "center",
                maxWidth: "200px",
              }}
              onMouseEnter={(e) => {
                if (!(draggedItem && draggedItem.isFolder === false)) {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3))";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 25px rgba(139, 92, 246, 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!(draggedItem && draggedItem.isFolder === false)) {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.2)";
                }
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "12px",
                  background: "linear-gradient(135deg, #8b5cf6, #a855f7)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "24px",
                }}
              >
                ←
              </div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: "1rem", fontWeight: 700 }}>
                  Back to Home
                </div>
                <div style={{ fontSize: "0.8rem", opacity: 0.8 }}>
                  Drag icons here to move them back
                </div>
              </div>
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
