import { useCallback } from "react";
import {
  type OutputFormat,
  extractPageContentAsync,
} from "@/utils/page-content";

export const usePageContent = () => {
  const extractPageContent = useCallback(
    (format: OutputFormat, fresh: boolean = false) =>
      extractPageContentAsync(format, fresh),
    []
  );

  return { extractPageContent };
};