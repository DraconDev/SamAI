export type Store = {
    env: string;
    hiddenResults: { [pattern: string]: boolean };
    highlightedResults: { [pattern: string]: string };
    defaultHighlightColor: string;
    suspended: boolean;
};
