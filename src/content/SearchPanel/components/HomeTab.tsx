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
  isFavorite?: boolean; // For favorites system
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
  const [isAddingIcon, setIsAddingIcon] = useState(false);
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const [addMenuType, setAddMenuType] = useState<
    "current" | "custom" | "folder" | null
  >(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemUrl, setNewItemUrl] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggedOverFolder, setDraggedOverFolder] = useState<string | null>(
    null
  );
  const [dragPreviewIndex, setDragPreviewIndex] = useState<number | null>(null);
  const [faviconCache, setFaviconCache] = useState<Map<string, string>>(
    new Map()
  );

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    position: { x: number; y: number };
    item: HomeIcon | null;
  }>({
    visible: false,
    position: { x: 0, y: 0 },
    item: null,
  });

  // Edit mode state
  const [editingItem, setEditingItem] = useState<HomeIcon | null>(null);
  const [editValue, setEditValue] = useState("");

  // Touch/mobile support state
  const [touchTimeout, setTouchTimeout] = useState<NodeJS.Timeout | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);

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
      isFavorite: false,
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
      isFavorite: false,
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
    setIsAddMenuOpen(false);

    if (type === "current") {
      addCurrentSite();
    } else if (type === "folder") {
      setIsAddingIcon(false);
    } else {
      setIsAddingIcon(true);
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
      isFavorite: true,
    },
    {
      id: "1",
      name: "Google",
      url: "https://google.com",
      iconUrl: "https://www.google.com/favicon.ico",
      createdAt: new Date().toISOString(),
      order: 1,
      isFolder: false,
      isFavorite: true,
    },
    {
      id: "2",
      name: "GitHub",
      url: "https://github.com",
      iconUrl: "https://github.com/favicon.ico",
      createdAt: new Date().toISOString(),
      order: 2,
      isFolder: false,
      isFavorite: true,
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
      isFavorite: false,
    },
    {
      id: "4",
      name: "Stack Overflow",
      url: "https://stackoverflow.com",
      iconUrl: "https://stackoverflow.com/favicon.ico",
      createdAt: new Date().toISOString(),
      order: 4,
      isFolder: false,
      isFavorite: false,
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

  // Get items with search filtering
  const getFilteredItems = () => {
    const currentItems = getCurrentItems();
    if (!searchQuery.trim()) return currentItems;

    // Only show favorites when searching
    return currentItems
      .filter((item) => item.isFavorite)
      .filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
  };
  const filteredItems = getFilteredItems();

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
      isFavorite: false,
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

  // Context menu handlers
  const handleContextMenu = (e: React.MouseEvent, item: HomeIcon) => {
    e.preventDefault();
    e.stopPropagation();

    setContextMenu({
      visible: true,
      position: { x: e.clientX, y: e.clientY },
      item,
    });
  };

  const closeContextMenu = () => {
    setContextMenu({
      visible: false,
      position: { x: 0, y: 0 },
      item: null,
    });
  };

  // Handle clicks outside context menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (contextMenu.visible) {
        closeContextMenu();
      }
    };

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && contextMenu.visible) {
        closeContextMenu();
      }
    };

    if (contextMenu.visible) {
      document.addEventListener("click", handleClickOutside);
      document.addEventListener("keydown", handleEscape);

      return () => {
        document.removeEventListener("click", handleClickOutside);
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [contextMenu.visible]);

  // Edit functionality
  const startEditing = (item: HomeIcon) => {
    setEditingItem(item);
    setEditValue(item.name);
    closeContextMenu();
  };

  const saveEdit = async () => {
    if (!editingItem || !editValue.trim()) {
      setEditingItem(null);
      setEditValue("");
      return;
    }

    const newData = {
      ...homeData,
      icons: homeData.icons.map((icon) =>
        icon.id === editingItem.id ? { ...icon, name: editValue.trim() } : icon
      ),
    };

    await saveHomeData(newData);
    setEditingItem(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditValue("");
  };

  // Context menu actions
  const handleContextEdit = () => {
    if (contextMenu.item) {
      startEditing(contextMenu.item);
    }
  };

  const handleContextDelete = () => {
    if (contextMenu.item) {
      handleDeleteItem(contextMenu.item.id);
      closeContextMenu();
    }
  };

  const handleContextToggleFavorite = async () => {
    if (contextMenu.item) {
      const newData = {
        ...homeData,
        icons: homeData.icons.map((icon) =>
          icon.id === contextMenu.item!.id
            ? { ...icon, isFavorite: !icon.isFavorite }
            : icon
        ),
      };
      await saveHomeData(newData);
      closeContextMenu();
    }
  };

  // Touch handlers for mobile support
  const handleTouchStart = (e: React.TouchEvent, item: HomeIcon) => {
    if (editingItem) return;

    setTouchStartTime(Date.now());

    const timeout = setTimeout(() => {
      handleContextMenu(
        {
          clientX: e.touches[0].clientX,
          clientY: e.touches[0].clientY,
          preventDefault: () => {},
          stopPropagation: () => {},
        } as React.MouseEvent,
        item
      );
    }, 500); // 500ms long press

    setTouchTimeout(timeout);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchTimeout) {
      clearTimeout(touchTimeout);
      setTouchTimeout(null);
    }

    const touchDuration = Date.now() - touchStartTime;

    // If it was a short tap and context menu is not open, treat as regular click
    if (touchDuration < 500 && !contextMenu.visible && editingItem) {
      if (contextMenu.item) {
        handleItemClick(contextMenu.item);
        closeContextMenu();
      }
    }
  };

  const handleTouchCancel = () => {
    if (touchTimeout) {
      clearTimeout(touchTimeout);
      setTouchTimeout(null);
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

  const handleDragOver = (
    e: React.DragEvent,
    index: number,
    item: HomeIcon
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    // Show visual feedback based on what we're dragging and what we're dragging over
    if (draggedItem) {
      if (draggedItem.isFolder && item.isFolder) {
        // Folders dragged onto folders → green (reordering)
        setDraggedOverFolder(null);
        setDragPreviewIndex(index);
      } else if (!draggedItem.isFolder && !item.isFolder) {
        // Site icons dragged onto site icons → green (reordering)
        setDraggedOverFolder(null);
        setDragPreviewIndex(index);
      } else if (!draggedItem.isFolder && item.isFolder) {
        // Site icons dragged onto folders → blue (put into)
        setDraggedOverFolder(item.id);
        setDragPreviewIndex(null);
      } else {
        // Folders dragged onto site icons → no highlighting (invalid)
        setDraggedOverFolder(null);
        setDragPreviewIndex(null);
      }
    }
    setDragOverIndex(index);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if we're leaving the drag area completely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverIndex(null);
      setDraggedOverFolder(null);
      setDragPreviewIndex(null);
    }
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
      isFavorite: false,
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
    setDragPreviewIndex(null);

    if (!draggedItem) return;

    // Check if we have access to the dragged item
    const draggedIcon = homeData.icons.find(
      (item) => item.id === draggedItem.id
    );
    if (!draggedIcon) return;

    const isDraggedFromMain = !draggedIcon.folderId;
    const isTargetInMain = !homeData.currentFolderId;
    const isTargetSameLevel = draggedIcon.folderId === homeData.currentFolderId;

    // Case 1: Dropping onto a folder
    if (targetItem.isFolder && draggedItem.id !== targetItem.id) {
      // Allow moving non-folders from main level into folders
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
        setDraggedOverFolder(null);
        setDraggedItem(null);
        return;
      }
    }

    // Case 2: Reorder within current view (improved logic)
    if (isTargetSameLevel) {
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

    setDraggedOverFolder(null);
    setDraggedItem(null);
  };

  // Generate consistent vibrant colors for site name
  const getColorForSite = (name: string) => {
    const colors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E9",
      "#F8C471",
      "#82E0AA",
      "#F1948A",
      "#D7BDE2",
      "#A9DFBF",
      "#F9E79F",
      "#AED6F1",
      "#D5A6BD",
      "#A9CCE3",
      "#F4D03F",
      "#A3E4D7",
      "#F8C471",
      "#D7DBDD",
      "#A569BD",
      "#5DADE2",
      "#58D68D",
      "#F1948A",
      "#FAD7A0",
      "#D2B4DE",
      "#AED6F1",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Get domain icon or enhanced fallback icon
  const getIconForItem = (item: HomeIcon) => {
    if (item.isFolder) return "📁"; // Modern folder icon

    if (item.iconUrl) {
      return item.iconUrl;
    }

    try {
      const domain = new URL(item.url).hostname;
      return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
    } catch {
      return {
        type: "fallback",
        name: item.name,
        color: getColorForSite(item.name),
      };
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        background: "rgba(15, 23, 42, 0.95)",
        borderRadius: "16px",
        boxShadow: "0 24px 45px -18px rgba(0,0,0,0.65)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Enhanced Header */}
      <div
        style={{
          padding: "1.25rem",
          borderBottom: "1px solid rgba(51,65,85,0.4)",
          background: "rgba(30,41,59,0.95)",
          position: "relative",
        }}
      >
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1.25rem",
              padding: "0.75rem 0",
            }}
          >
            <div style={{ flex: 1, maxWidth: "400px" }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search favorites..."
                style={{
                  width: "100%",
                  padding: "0.875rem 1.25rem",
                  height: "48px",
                  borderRadius: "14px",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  background: "rgba(15, 23, 42, 0.95)",
                  color: "#f1f5f9",
                  fontSize: "0.95rem",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "all 0.3s ease",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#8b5cf6";
                  e.currentTarget.style.boxShadow =
                    "0 0 0 4px rgba(139, 92, 246, 0.15)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.3)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                flexShrink: 0,
              }}
            >
              {/* Plus Button */}
              <button
                onClick={(e) => {
                  setIsAddMenuOpen(!isAddMenuOpen);
                  // Add a small click animation
                  e.currentTarget.style.transform = "scale(0.95)";
                  setTimeout(() => {
                    e.currentTarget.style.transform = "scale(1)";
                  }, 100);
                }}
                style={{
                  padding: "0.875rem 1.25rem",
                  borderRadius: "14px",
                  border: "1px solid rgba(34, 197, 94, 0.4)",
                  background:
                    "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.15))",
                  color: "#86efac",
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  fontWeight: 700,
                  transition: "all 0.3s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  boxShadow: "0 4px 12px rgba(34, 197, 94, 0.25)",
                  minHeight: "48px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(34, 197, 94, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(34, 197, 94, 0.25)";
                }}
              >
                <span style={{ fontSize: "1.4rem", fontWeight: 900 }}>+</span>
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Menu Dropdown - positioned relative to header */}
      {isAddMenuOpen && (
        <div
          style={{
            position: "absolute",
            top: "70px",
            right: "12px",
            background: "rgba(30, 41, 59, 0.98)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            borderRadius: "12px",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.4)",
            zIndex: 10000,
            padding: "0.5rem",
            minWidth: "160px",
            backdropFilter: "blur(20px)",
            overflow: "visible",
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
            <span>📂</span>
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
                  "linear-gradient(135deg, rgba(34, 197, 94, 0.25), rgba(16, 185, 129, 0.25))";
                e.currentTarget.style.boxShadow =
                  "0 8px 25px rgba(34, 197, 94, 0.4), 0 0 0 1px rgba(34, 197, 94, 0.6)";
                e.currentTarget.style.borderColor = "rgba(34, 197, 94, 0.8)";
              }
            }}
            onDragLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(236, 72, 153, 0.15))";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)";
              e.currentTarget.style.borderColor = "rgba(34, 197, 94, 0.3)";
            }}
            onDrop={async (e) => {
              if (draggedItem && draggedItem.isFolder === false) {
                e.preventDefault();
                // Move dragged item back to main level while staying in current folder
                const newData = {
                  ...homeData,
                  // Don't change currentFolderId - stay in current folder
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
              borderRadius: "16px",
              padding: "1.25rem 1.5rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: "0.9rem",
              boxShadow:
                "0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)",
              textAlign: "center",
              width: "100%",
              position: "relative",
              overflow: "hidden",
              backdropFilter: "blur(10px)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, rgba(34, 197, 94, 0.22), rgba(16, 185, 129, 0.18))";
              e.currentTarget.style.boxShadow =
                "0 10px 30px rgba(34, 197, 94, 0.3), 0 0 0 1px rgba(34, 197, 94, 0.4), inset 0 1px 0 rgba(255,255,255,0.2)";
              e.currentTarget.style.borderColor = "rgba(34, 197, 94, 0.6)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(16, 185, 129, 0.08))";
              e.currentTarget.style.boxShadow =
                "0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255,255,255,0.1)";
              e.currentTarget.style.borderColor = "rgba(34, 197, 94, 0.3)";
            }}
          >
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #10b981, #059669)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 12px rgba(16, 185, 129, 0.3)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow =
                  "inset 0 1px 0 rgba(255,255,255,0.3), 0 6px 20px rgba(16, 185, 129, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "inset 0 1px 0 rgba(255,255,255,0.2), 0 4px 12px rgba(16, 185, 129, 0.3)";
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
                  marginBottom: "2px",
                }}
              >
                Back to Home
              </div>
              <div
                style={{
                  fontSize: "0.8rem",
                  opacity: 0.9,
                  fontWeight: 500,
                  color: "rgba(134, 239, 172, 0.8)",
                }}
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
                width: "3px",
                height: "70%",
                background:
                  "linear-gradient(to bottom, transparent, rgba(34, 197, 94, 0.4), rgba(16, 185, 129, 0.5), rgba(34, 197, 94, 0.4), transparent)",
                borderRadius: "2px",
                boxShadow: "0 0 8px rgba(34, 197, 94, 0.3)",
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
              <button
                onClick={handleAddIcon}
                style={{
                  flex: 1,
                  padding: "0.9rem 1.5rem",
                  borderRadius: "12px",
                  border: "1px solid rgba(34, 197, 94, 0.6)",
                  background:
                    "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))",
                  color: "#86efac",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontWeight: 700,
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(34, 197, 94, 0.25)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(34, 197, 94, 0.3), rgba(16, 185, 129, 0.3))";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(34, 197, 94, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(34, 197, 94, 0.2), rgba(16, 185, 129, 0.2))";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(34, 197, 94, 0.25)";
                }}
              >
                Add Site
              </button>
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
                  background:
                    "linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(59, 130, 246, 0.2))",
                  color: "#60a5fa",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  fontWeight: 700,
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(96, 165, 250, 0.25)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(96, 165, 250, 0.3), rgba(59, 130, 246, 0.3))";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 20px rgba(96, 165, 250, 0.35)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "linear-gradient(135deg, rgba(96, 165, 250, 0.2), rgba(59, 130, 246, 0.2))";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(96, 165, 250, 0.25)";
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
              gap: "0.125rem",
              justifyItems: "center",
              padding: "0.5rem",
              position: "relative",
            }}
          >
            {filteredItems.map((item, index) => {
              const isDraggedOver = dragOverIndex === index;
              const isPreviewIndex = dragPreviewIndex === index && draggedItem;
              const isDraggedOverFolder = draggedOverFolder === item.id;

              return (
                <div
                  key={item.id}
                  draggable={!editingItem}
                  onDragStart={(e) =>
                    editingItem
                      ? e.preventDefault()
                      : handleDragStart(e, item, index)
                  }
                  onDragOver={(e) =>
                    !editingItem && handleDragOver(e, index, item)
                  }
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => !editingItem && handleDrop(e, index, item)}
                  onClick={() => {
                    if (editingItem?.id === item.id) {
                      saveEdit();
                    } else if (!editingItem) {
                      handleItemClick(item);
                    }
                  }}
                  onContextMenu={(e) =>
                    !editingItem && handleContextMenu(e, item)
                  }
                  onTouchStart={(e) =>
                    !editingItem && handleTouchStart(e, item)
                  }
                  onTouchEnd={handleTouchEnd}
                  onTouchCancel={handleTouchCancel}
                  style={{
                    position: "relative",
                    width: "100%",
                    maxWidth: "76px",
                    padding: "0.1rem",
                    borderRadius: "6px",
                    overflow: "hidden",
                    border: isDraggedOverFolder
                      ? "2px solid rgba(59, 130, 246, 0.8)"
                      : isPreviewIndex
                      ? "2px dashed rgba(34, 197, 94, 0.8)"
                      : editingItem?.id === item.id
                      ? "2px solid rgba(139, 92, 246, 0.8)"
                      : "2px solid transparent",
                    color: "#ffffff",
                    textAlign: "center",
                    cursor: editingItem ? "text" : "pointer",
                    transition: "all 0.15s ease",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "0.25rem",
                    userSelect: editingItem?.id === item.id ? "text" : "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!editingItem) {
                      // Remove hover effects for cleaner border-only visuals
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!editingItem) {
                      // Remove hover effects for cleaner border-only visuals
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
                      width: "52px",
                      height: "52px",
                      borderRadius: "10px",
                      background: "transparent",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "22px",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
                    }}
                  >
                    {item.isFolder ? (
                      <span style={{ fontSize: "44px" }}>📂</span>
                    ) : (
                      (() => {
                        const iconResult = getIconForItem(item);
                        if (
                          typeof iconResult === "string" &&
                          iconResult.startsWith("http")
                        ) {
                          return (
                            <img
                              src={iconResult}
                              alt={item.name}
                              style={{
                                width: "52px",
                                height: "52px",
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
                        } else if (
                          typeof iconResult === "object" &&
                          iconResult.type === "fallback"
                        ) {
                          return (
                            <div
                              style={{
                                width: "52px",
                                height: "52px",
                                borderRadius: "50%",
                                background: `linear-gradient(135deg, ${iconResult.color}, ${iconResult.color}dd)`,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "20px",
                                fontWeight: 700,
                                color: "white",
                                textShadow: "0 1px 3px rgba(0,0,0,0.4)",
                                boxShadow:
                                  "0 6px 16px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.2)",
                                border: "2px solid rgba(255,255,255,0.1)",
                                position: "relative",
                                overflow: "hidden",
                              }}
                            >
                              {/* Subtle shine effect */}
                              <div
                                style={{
                                  position: "absolute",
                                  top: "2px",
                                  left: "2px",
                                  right: "2px",
                                  height: "40%",
                                  background:
                                    "linear-gradient(135deg, rgba(255,255,255,0.3), rgba(255,255,255,0.1))",
                                  borderRadius: "50%",
                                  transform: "rotate(-45deg)",
                                }}
                              />
                              {iconResult.name.charAt(0).toUpperCase()}
                            </div>
                          );
                        } else {
                          return (
                            <span style={{ fontSize: "24px" }}>
                              {typeof iconResult === "string"
                                ? iconResult
                                : "📄"}
                            </span>
                          );
                        }
                      })()
                    )}
                    <span style={{ display: "none", fontSize: "24px" }}>
                      {item.name.charAt(0).toUpperCase()}
                    </span>

                    {/* Favorite indicator */}
                    {item.isFavorite && (
                      <div
                        style={{
                          position: "absolute",
                          top: "-2px",
                          right: "-2px",
                          width: "16px",
                          height: "16px",
                          background:
                            "linear-gradient(135deg, #fbbf24, #f59e0b)",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "10px",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                          border: "2px solid rgba(15, 23, 42, 0.95)",
                        }}
                      >
                        ⭐
                      </div>
                    )}
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
                    {editingItem?.id === item.id ? (
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            saveEdit();
                          } else if (e.key === "Escape") {
                            cancelEdit();
                          }
                          e.stopPropagation();
                        }}
                        onBlur={saveEdit}
                        style={{
                          fontSize: "0.55rem",
                          fontWeight: 500,
                          color: "#ffffff",
                          background: "rgba(15, 23, 42, 0.95)",
                          border: "1px solid rgba(139, 92, 246, 0.6)",
                          borderRadius: "4px",
                          padding: "2px 4px",
                          width: "100%",
                          textAlign: "center",
                          outline: "none",
                          height: "20px",
                        }}
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : item.name.length > 12 ? (
                      item.name.substring(0, 12) + "..."
                    ) : (
                      item.name
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "4rem 2rem",
              color: "#94a3b8",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "2rem" }}>🏠</div>
            <div
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "1rem",
                color: "#e2e8f0",
              }}
            >
              Your home is empty
            </div>
            <div
              style={{
                fontSize: "1rem",
                marginBottom: "2rem",
                color: "#94a3b8",
              }}
            >
              Tap the + button in the header to start adding your apps
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu.visible && contextMenu.item && (
        <div
          style={{
            position: "fixed",
            top: contextMenu.position.y,
            left: contextMenu.position.x,
            background: "rgba(30, 41, 59, 0.98)",
            border: "1px solid rgba(139, 92, 246, 0.4)",
            borderRadius: "12px",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.6)",
            zIndex: 10000,
            padding: "0.5rem",
            minWidth: "140px",
            backdropFilter: "blur(20px)",
            transform: "translateY(0)",
            animation: "contextMenuSlideIn 0.2s ease-out",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleContextEdit}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              border: "none",
              background: "transparent",
              color: "#8b5cf6",
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
              e.currentTarget.style.background = "rgba(139, 92, 246, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span>✏️</span>
            Edit
          </button>
          <button
            onClick={handleContextToggleFavorite}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              border: "none",
              background: "transparent",
              color: contextMenu.item?.isFavorite ? "#fbbf24" : "#f59e0b",
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
              e.currentTarget.style.background = "rgba(245, 158, 11, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span>{contextMenu.item?.isFavorite ? "⭐" : "☆"}</span>
            {contextMenu.item?.isFavorite
              ? "Remove from Favorites"
              : "Add to Favorites"}
          </button>
          <button
            onClick={handleContextDelete}
            style={{
              width: "100%",
              padding: "0.75rem 1rem",
              border: "none",
              background: "transparent",
              color: "#ef4444",
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
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span>🗑️</span>
            Delete
          </button>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes contextMenuSlideIn {
          0% {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default HomeTab;
