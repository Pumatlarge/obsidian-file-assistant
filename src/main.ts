import { Plugin, WorkspaceLeaf } from 'obsidian';
import { SidebarView, VIEW_TYPE_SIDEBAR } from './SidebarView';

export default class FileAssistantPlugin extends Plugin {
    async onload() {
        this.registerView(
            VIEW_TYPE_SIDEBAR,
            (leaf) => new SidebarView(leaf, this)
        );

        this.addRibbonIcon('list-tree', '文档助手', () => {
            this.activateView();
        });

        this.addCommand({
            id: 'open-file-assistant',
            name: 'Open Document Assistant',
            callback: () => {
                this.activateView();
            }
        });
    }

    onunload() {
    }

    async activateView() {
        const { workspace } = this.app;

        let leaf: WorkspaceLeaf | null = null;

        const leaves = workspace.getLeavesOfType(VIEW_TYPE_SIDEBAR);
        if (leaves.length > 0) {
            leaf = leaves[0];
        } else {
            const rightLeaf = workspace.getRightLeaf(false);
            if (rightLeaf) {
                await rightLeaf.setViewState({
                    type: VIEW_TYPE_SIDEBAR,
                    active: true,
                });
                leaf = workspace.getLeavesOfType(VIEW_TYPE_SIDEBAR)[0] || null;
            }
        }

        if (leaf) {
            workspace.revealLeaf(leaf);
        }
    }
}
