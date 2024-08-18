class PluginLoader {
    constructor() {
        this.plugins = {};
    }

    async loadAllPlugins() {
        await this.loadBuiltinPlugins('elements');
        await this.loadPluginsForCategory('elements');
        // Load other categories here if needed
    }

    async loadBuiltinPlugins(category) {
        const plugins = await window.electron.getBuiltinPlugins(category);
        for (const plugin of plugins) {
            await this.loadPlugin(category, plugin.name, plugin.path, true);
        }
    }

    async loadPluginsForCategory(category) {
        const plugins = await window.electron.getPlugins(category);
        for (const plugin of plugins) {
            if (plugin.enabled) {
                await this.loadPlugin(category, plugin.name, plugin.path, plugin.isBuiltIn);
            }
        }
    }

    async loadPlugin(category, name, path, isBuiltIn) {
        try {
            let module;
            if (isBuiltIn) {
                module = window.electron.requirePlugin(path);
            } else {
                module = await import(/* webpackIgnore: true */ path);
            }
            if (module) {
                this.plugins[category] = this.plugins[category] || {};
                this.plugins[category][name] = { ...(module.default || module), isBuiltIn };
                this.addComponentToPane(category, name);
            } else {
                console.error(`Failed to load plugin: ${name}`);
            }
        } catch (error) {
            console.error(`Failed to load plugin: ${name}`, error);
        }
    }

    addComponentToPane(category, name) {
        const componentPane = document.getElementById('component-pane');
        const component = document.createElement('div');
        component.className = 'component';
        component.draggable = true;
        component.dataset.type = name;
        component.dataset.category = category;
        component.textContent = this.plugins[category][name].displayName;
        componentPane.appendChild(component);
    }

    getPlugin(category, name) {
        return this.plugins[category] && this.plugins[category][name];
    }

    clearComponents() {
        const componentPane = document.getElementById('component-pane');
        componentPane.innerHTML = '';
    }
}

const pluginLoader = new PluginLoader();

window.electron.onReloadPlugins(async () => {
    pluginLoader.clearComponents();
    await pluginLoader.loadAllPlugins();
});

// Initialize plugin loading
pluginLoader.loadAllPlugins();