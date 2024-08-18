class PluginManager {
    constructor() {
        this.plugins = {
            elements: [],
            other: []
        };
        this.initEventListeners();
    }

    async loadPlugins(category) {
        this.plugins[category] = await window.electron.getPlugins(category);
        this.updatePluginList(category);
    }

    async addPlugin(category) {
        const result = await window.electron.addPlugin(category);
        if (result.success) {
            await this.loadPlugins(category);
        } else {
            console.error('Failed to add plugin:', result.error);
        }
    }

    async togglePlugin(category, name) {
        const plugin = this.plugins[category].find(p => p.name === name);
        if (plugin && !plugin.isBuiltIn) {
            const result = await window.electron.togglePlugin(category, name, !plugin.enabled);
            await this.loadPlugins(category);
        }
    }

    async removePlugin(category, name) {
        const result = await window.electron.removePlugin(category, name);
        if (result.success) {
            await this.loadPlugins(category);
        } else {
            console.error('Failed to remove plugin:', result.error);
        }
    }

    updatePluginList(category) {
        const listElement = document.getElementById(`${category}-plugin-list`);
        listElement.innerHTML = '';
        this.plugins[category].forEach(plugin => {
            const li = document.createElement('li');
            li.textContent = plugin.name + (plugin.isBuiltIn ? ' (Built-in)' : '');
            if (!plugin.isBuiltIn) {
                const toggleBtn = document.createElement('button');
                toggleBtn.textContent = plugin.enabled ? 'Disable' : 'Enable';
                toggleBtn.addEventListener('click', () => this.togglePlugin(category, plugin.name));
                li.appendChild(toggleBtn);

                const removeBtn = document.createElement('button');
                removeBtn.textContent = 'Remove';
                removeBtn.addEventListener('click', () => this.removePlugin(category, plugin.name));
                li.appendChild(removeBtn);
            }
            listElement.appendChild(li);
        });
    }

    initEventListeners() {
        document.getElementById('add-element-plugin').addEventListener('click', () => this.addPlugin('elements'));
        document.getElementById('add-other-plugin').addEventListener('click', () => this.addPlugin('other'));
    }
}

const pluginManager = new PluginManager();
pluginManager.loadPlugins('elements');
pluginManager.loadPlugins('other');