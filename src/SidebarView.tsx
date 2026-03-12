import { ItemView, WorkspaceLeaf } from 'obsidian';
import * as React from 'react';
import { Root, createRoot } from 'react-dom/client';
import { AssistantPanel } from './components/AssistantPanel';
import FileAssistantPlugin from './main';

export const VIEW_TYPE_SIDEBAR = "file-assistant-sidebar";

export class SidebarView extends ItemView {
    root: Root | null = null;
    plugin: FileAssistantPlugin;

    constructor(leaf: WorkspaceLeaf, plugin: FileAssistantPlugin) {
        super(leaf);
        this.plugin = plugin;
    }

    getViewType() {
        return VIEW_TYPE_SIDEBAR;
    }

    getDisplayText() {
        return "文档助手";
    }

    async onOpen() {
        const container = this.containerEl.children[1] as HTMLElement;
        container.empty();

        container.classList.add("file-assistant-sidebar-content");

        this.root = createRoot(container);
        this.root.render(
            <React.StrictMode>
                <AssistantPanel plugin={this.plugin} />
            </React.StrictMode>
        );
    }

    async onClose() {
        this.root?.unmount();
    }
}
