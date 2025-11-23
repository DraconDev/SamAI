export function markdownToJSON(markdown: string): FormFieldData | null {
    try {
        const jsonMatch = markdown.match(/```(?:json)?\n([\s\S]*?)\n```/);
        // console.log(jsonMatch);
        if (!jsonMatch) {
            return null;
        }
        const markdownParse = JSON.parse(jsonMatch[1]);
        // console.log(markdownParse);
        return markdownParse;
    } catch (error) {
        return null;
    }
}
