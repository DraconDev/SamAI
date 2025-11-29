"use client";

import {
    DndContext,
    DragEndEvent,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import AddIcon from "../icons/AddIcon";
import HomeBox from "./HomeBox";
import { IconType } from "@/lib/defaultIcons";

interface IconGridProps {
    icons: IconType[];
    iconSize: string;
    isSharedView: boolean;
    isDraggingDisabled: boolean;
    onDragEnd: (event: DragEndEvent) => void;
    onDelete?: (id: number) => void;
    onAddClick?: () => void;
}

export default function IconGrid({
    icons,
    iconSize,
    isSharedView,
    isDraggingDisabled,
    onDragEnd,
    onDelete,
    onAddClick,
}: IconGridProps) {
    const iconBoxes = icons.map((icon) => (
        <HomeBox
            key={icon.id}
            {...icon}
            onDelete={!isSharedView ? onDelete : undefined}
            iconSize={iconSize}
            isSharedView={isSharedView}
            isDraggingDisabled={isDraggingDisabled}
        />
    ));

    const addIconButton = !isSharedView && onAddClick && (
        <AddIcon key="add-icon" onClick={onAddClick} iconSize={iconSize} />
    );

    return (
        <div className="flex flex-col items-center gap-6">
            <DndContext
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
            >
                <SortableContext
                    items={icons.map((icon) => icon.id)}
                    strategy={rectSortingStrategy}
                >
                    <div className="flex flex-wrap justify-center gap-2">
                        {iconBoxes}
                        {addIconButton}
                    </div>
                </SortableContext>
            </DndContext>
        </div>
    );
}
