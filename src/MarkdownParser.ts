export type ParsedItemType = "heading" | "highlight" | "bold" | "italic" | "code" | "tag" | "callout" | "comment";

export interface ParsedItem {
    type: ParsedItemType;
    subType?: string;
    content: string;
    lineIndex: number;
    rawText: string;
}

export class MarkdownParser {
    static parse(text: string): ParsedItem[] {
        const lines = text.split('\n');
        const items: ParsedItem[] = [];

        let inCodeBlock = false;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (line.trim().startsWith('```')) {
                inCodeBlock = !inCodeBlock;
                if (!inCodeBlock) {
                    // We can optionally add the closing backticks as well, but for simplicity we ignore it or just add the block
                }
                items.push({ type: 'code', content: line, lineIndex: i, rawText: line });
                continue;
            }

            if (inCodeBlock) {
                items.push({ type: 'code', content: line, lineIndex: i, rawText: line });
                continue;
            }

            // Heading: # Heading
            const headingMatch = line.match(/^(#{1,6})\s+(.*)/);
            if (headingMatch) {
                const level = headingMatch[1].length;
                items.push({ type: 'heading', subType: `h${level}`, content: headingMatch[2], lineIndex: i, rawText: line });
            }

            // Callout: > [!info] ...
            const calloutMatch = line.match(/^>\s*\[!(\w+)\](.*)/);
            if (calloutMatch) {
                const calloutType = calloutMatch[1];
                items.push({ type: 'callout', subType: calloutType.toLowerCase(), content: calloutType + (calloutMatch[2] ? ' ' + calloutMatch[2].trim() : ''), lineIndex: i, rawText: line });
            }

            this.extractMatches(line, i, /==(.*?)==/g, 'highlight', items);
            this.extractMatches(line, i, /\*\*(.*?)\*\*/g, 'bold', items);
            this.extractMatches(line, i, /__(.*?)__/g, 'bold', items);

            // Italic: *foo* or _foo_ but not **foo** and not inside a word
            // JS regex doesn't easily support full lookbehinds in all engines, but Obsidian uses modern V8
            this.extractMatches(line, i, /(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, 'italic', items);
            this.extractMatches(line, i, /(?<!_)_(?!_)(.*?)(?<!_)_(?!_)/g, 'italic', items);

            // Code inline: `foo`
            this.extractMatches(line, i, /`([^`]+)`/g, 'code', items);

            // Comment: %%foo%%
            this.extractMatches(line, i, /%%(.*?)%%/g, 'comment', items);

            // Tags: #tag
            // Avoid matching headings that start with #
            if (!headingMatch) {
                const tagRegex = /(?:^|\s)(#[^\s#]+)/g;
                let match;
                while ((match = tagRegex.exec(line)) !== null) {
                    items.push({ type: 'tag', content: match[1], lineIndex: i, rawText: match[1] });
                }
            }
        }

        return items;
    }

    private static extractMatches(line: string, lineIndex: number, regex: RegExp, type: ParsedItemType, items: ParsedItem[]) {
        let match;
        regex.lastIndex = 0;
        while ((match = regex.exec(line)) !== null) {
            items.push({
                type,
                content: match[1] || match[0],
                lineIndex,
                rawText: match[0]
            });
        }
    }
}
