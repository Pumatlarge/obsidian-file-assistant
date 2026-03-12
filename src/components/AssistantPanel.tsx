import * as React from 'react';
import { EventRef, TFile } from 'obsidian';
import FileAssistantPlugin from '../main';
import { MarkdownParser, ParsedItem, ParsedItemType } from '../MarkdownParser';

// SVG Icons
const Icons = {
    all: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>,
    heading: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12h16" /><path d="M4 18V6" /><path d="M20 18V6" /></svg>,
    bold: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 12a4 4 0 0 0 0-8H6v8" /><path d="M15 20a4 4 0 0 0 0-8H6v8Z" /></svg>,
    highlight: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 11-6 6v3h9l3-3" /><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" /></svg>,
    comment: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" /><path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" /></svg>,
    italic: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" x2="10" y1="4" y2="4" /><line x1="14" x2="5" y1="20" y2="20" /><line x1="15" x2="9" y1="4" y2="20" /></svg>,
    code: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
    tag: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" /><circle cx="7.5" cy="7.5" r=".5" fill="currentColor" /></svg>,
    callout: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H3z" /><path d="M6 16v-3a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" /><path d="M11 20h8a2 2 0 0 0 2-2v-3" /><path d="M3 9h3a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H3z" /><path d="M6 7v3a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7" /><path d="M11 3h8a2 2 0 0 1 2 2v3" /></svg>,
    refresh: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 21v-5h5" /></svg>,
    download: <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
};

const TYPE_CONFIG: Record<ParsedItemType, { label: string, color: string, className: string, icon: React.ReactNode }> = {
    heading: { label: '标题', color: '#007AFF', className: 'fa-heading', icon: Icons.heading },
    bold: { label: '加粗', color: '#FF3B30', className: 'fa-bold', icon: Icons.bold },
    highlight: { label: '高亮', color: '#FF9500', className: 'fa-highlight', icon: Icons.highlight },
    comment: { label: '备注', color: '#AF52DE', className: 'fa-comment', icon: Icons.comment },
    italic: { label: '斜体', color: '#8E8E93', className: 'fa-italic', icon: Icons.italic },
    code: { label: '代码', color: '#5856D6', className: 'fa-code', icon: Icons.code },
    tag: { label: '标签', color: '#34C759', className: 'fa-tag', icon: Icons.tag },
    callout: { label: 'Callout', color: '#FF2D55', className: 'fa-callout', icon: Icons.callout }
};

const CALLOUT_COLORS: Record<string, string> = {
    note: '#086ddd', abstract: '#00b0ff', info: '#00b0ff', todo: '#00b0ff',
    tip: '#448a33', hint: '#448a33', important: '#448a33',
    success: '#00c853', check: '#00c853', done: '#00c853',
    question: '#fb8c00', help: '#fb8c00', faq: '#fb8c00', warning: '#ff9800', caution: '#ff9800', attention: '#ff9800',
    failure: '#e53935', fail: '#e53935', missing: '#e53935', danger: '#e53935', error: '#e53935', bug: '#d32f2f',
    example: '#7b1fa2', quote: '#9e9e9e', cite: '#9e9e9e'
};

const getCalloutColor = (type: string) => CALLOUT_COLORS[type.toLowerCase()] || '#8B5CF6';

export const AssistantPanel: React.FC<{ plugin: FileAssistantPlugin }> = ({ plugin }) => {
    const [items, setItems] = React.useState<ParsedItem[]>([]);
    const [activeFilters, setActiveFilters] = React.useState<Set<ParsedItemType>>(new Set());
    const [activeSubFilters, setActiveSubFilters] = React.useState<{ heading: Set<string>, callout: Set<string> }>({
        heading: new Set(),
        callout: new Set()
    });

    const parseActiveFile = React.useCallback(async () => {
        const file = plugin.app.workspace.getActiveFile();
        if (file) {
            const text = await plugin.app.vault.cachedRead(file);
            const parsed = MarkdownParser.parse(text);
            setItems(parsed);
        } else {
            setItems([]);
        }
    }, [plugin.app]);

    React.useEffect(() => {
        // Initial parse
        parseActiveFile();

        const { workspace, vault } = plugin.app;

        const leafChangeRef = workspace.on('active-leaf-change', () => {
            parseActiveFile();
        });

        const modifyRef = vault.on('modify', (file: TFile) => {
            const activeFile = workspace.getActiveFile();
            if (activeFile && file.path === activeFile.path) {
                parseActiveFile();
            }
        });

        return () => {
            workspace.offref(leafChangeRef);
            vault.offref(modifyRef);
        };
    }, [plugin.app, parseActiveFile]);

    const toggleFilter = (type: ParsedItemType | 'all') => {
        if (type === 'all') {
            setActiveFilters(new Set());
            setActiveSubFilters({ heading: new Set(), callout: new Set() });
            return;
        }

        const newFilters = new Set(activeFilters);
        if (newFilters.has(type)) {
            newFilters.delete(type);
        } else {
            newFilters.add(type);
        }
        setActiveFilters(newFilters);
    };

    const toggleSubFilter = (parentType: 'heading' | 'callout', subType: string) => {
        setActiveSubFilters(prev => {
            const newSet = new Set(prev[parentType]);
            if (newSet.has(subType)) {
                newSet.delete(subType);
            } else {
                newSet.add(subType);
            }
            return { ...prev, [parentType]: newSet };
        });
    };

    const filteredItems = items.filter(item => {
        if (activeFilters.size > 0 && !activeFilters.has(item.type)) return false;

        if (item.type === 'heading' && activeSubFilters.heading.size > 0) {
            if (!item.subType || !activeSubFilters.heading.has(item.subType)) return false;
        }

        if (item.type === 'callout' && activeSubFilters.callout.size > 0) {
            if (!item.subType || !activeSubFilters.callout.has(item.subType)) return false;
        }

        return true;
    });

    const availableCalloutTypes = React.useMemo(() => {
        const types = new Set<string>();
        items.forEach(i => {
            if (i.type === 'callout' && i.subType) {
                types.add(i.subType.toLowerCase());
            }
        });
        return Array.from(types).sort();
    }, [items]);

    const exportToMarkdown = async () => {
        if (filteredItems.length === 0) return;

        const content = filteredItems.map(item => {
            return `- [${TYPE_CONFIG[item.type].label}] ${item.content}`;
        }).join('\n');

        const fileName = `文档助手导出 - ${Date.now()}.md`;

        try {
            const newFile = await plugin.app.vault.create(fileName, content);
            plugin.app.workspace.getLeaf(true).openFile(newFile);
        } catch (e) {
            console.error('Failed to create export file', e);
        }
    };

    const jumpToLine = (item: ParsedItem) => {
        const leaf = plugin.app.workspace.getMostRecentLeaf();
        if (leaf && leaf.view.getViewType() === "markdown") {
            const view = leaf.view as any;
            if (view.editor) {
                view.editor.setCursor(item.lineIndex, 0);
                view.editor.scrollIntoView({ from: { line: item.lineIndex, ch: 0 }, to: { line: item.lineIndex, ch: 0 } }, true);
            }
        }
    };

    const types = (Object.keys(TYPE_CONFIG) as Array<ParsedItemType>);

    return (
        <div className="fa-container">
            <div className="fa-header-title">
                <h2>文档助手</h2>
            </div>

            <div className="fa-active-file-title">
                {plugin.app.workspace.getActiveFile()?.basename || "No active file"}
            </div>

            <div className="fa-stats">
                关键内容 {items.length} · 当前筛选 {filteredItems.length}
            </div>

            <div className="fa-filters-container">
                <div className="fa-filters">
                    <button
                        className={`fa-filter-btn ${activeFilters.size === 0 ? 'active' : ''}`}
                        onClick={() => toggleFilter('all')}
                    >
                        <span className="fa-filter-icon">{Icons.all}</span>
                        全部
                    </button>
                    {types.map(type => (
                        <button
                            key={type}
                            className={`fa-filter-btn ${TYPE_CONFIG[type].className} ${activeFilters.has(type) ? 'active' : ''}`}
                            onClick={() => toggleFilter(type)}
                        >
                            <span className="fa-filter-icon">{TYPE_CONFIG[type].icon}</span>
                            {TYPE_CONFIG[type].label}
                        </button>
                    ))}
                </div>

                {activeFilters.has('heading') && (
                    <div className="fa-sub-filters">
                        {['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].map(h => (
                            <button
                                key={h}
                                className={`fa-sub-filter-btn ${activeSubFilters.heading.has(h) ? 'active' : ''}`}
                                onClick={() => toggleSubFilter('heading', h)}
                                style={{ '--c': TYPE_CONFIG['heading'].color } as React.CSSProperties}
                            >
                                {h.toUpperCase()}
                            </button>
                        ))}
                    </div>
                )}

                {activeFilters.has('callout') && availableCalloutTypes.length > 0 && (
                    <div className="fa-sub-filters">
                        {availableCalloutTypes.map(c => (
                            <button
                                key={c}
                                className={`fa-sub-filter-btn ${activeSubFilters.callout.has(c) ? 'active' : ''}`}
                                onClick={() => toggleSubFilter('callout', c)}
                                style={{ '--c': getCalloutColor(c) } as React.CSSProperties}
                            >
                                {c.toUpperCase()}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="fa-list-container">
                {filteredItems.map((item, idx) => (
                    <div
                        key={`${item.type}-${idx}`}
                        className={`fa-list-item ${TYPE_CONFIG[item.type].className}`}
                        onClick={() => jumpToLine(item)}
                    >
                        <div className="fa-list-item-header">
                            <span
                                className="fa-badge"
                                style={item.type === 'callout' && item.subType ? { '--c': getCalloutColor(item.subType) } as React.CSSProperties : undefined}
                            >
                                {TYPE_CONFIG[item.type].icon}
                                <span>
                                    {item.type === 'callout' && item.subType
                                        ? item.subType.toUpperCase()
                                        : item.type === 'heading' && item.subType
                                            ? item.subType.toUpperCase()
                                            : TYPE_CONFIG[item.type].label}
                                </span>
                            </span>
                        </div>
                        <span className="fa-content">{item.content}</span>
                    </div>
                ))}
            </div>

            <div className="fa-actions">
                <button className="fa-btn fa-btn-refresh" onClick={parseActiveFile}>
                    {Icons.refresh} 刷新
                </button>
                <button className="fa-btn fa-btn-export" onClick={exportToMarkdown}>
                    {Icons.download} 导出 Markdown
                </button>
            </div>
        </div>
    );
};
