let currentProject = { elements: [] };
let selectedElement = null;

document.addEventListener('DOMContentLoaded', async () => {
    const canvas = document.getElementById('canvas');
    const componentPane = document.getElementById('component-pane');
    const propertiesPane = document.getElementById('properties-content');

    await pluginLoader.loadAllPlugins();

    componentPane.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({
            type: e.target.dataset.type,
            category: e.target.dataset.category
        }));
    });

    canvas.addEventListener('dragover', (e) => {
        e.preventDefault();
    });

    canvas.addEventListener('drop', (e) => {
        e.preventDefault();
        const data = JSON.parse(e.dataTransfer.getData('text'));
        const element = createCanvasElement(data.category, data.type, e.clientX, e.clientY);
        canvas.appendChild(element);
    });

    window.electron.onNewProject(() => {
        currentProject = { elements: [] };
        clearCanvas();
    });

    window.electron.onOpenProject(async () => {
        const result = await window.electron.openProject();
        if (result.success) {
            currentProject = result.data;
            loadProjectToCanvas();
        } else {
            console.error('Failed to open project:', result.error);
        }
    });

    window.electron.onSaveProject(async () => {
        const result = await window.electron.saveProject(currentProject);
        if (result.success) {
            console.log('Project saved successfully');
        } else {
            console.error('Failed to save project:', result.error);
        }
    });

    window.electron.onReloadPlugins(async () => {
        pluginLoader.clearComponents();
        await pluginLoader.loadAllPlugins();
    });

    function createCanvasElement(category, type, x, y) {
        const plugin = pluginLoader.getPlugin(category, type);
        if (!plugin) return null;

        const element = document.createElement('div');
        element.classList.add('canvas-element');
        element.style.left = `${x - canvas.offsetLeft}px`;
        element.style.top = `${y - canvas.offsetTop}px`;
        element.dataset.type = type;
        element.dataset.category = category;

        const content = plugin.create();
        element.appendChild(content);

        element.addEventListener('click', (e) => {
            e.stopPropagation();
            selectElement(element);
        });

        element.addEventListener('mousedown', startDragging);

        const elementData = {
            type,
            category,
            x: element.style.left,
            y: element.style.top,
            properties: {}
        };

        if (plugin.properties) {
            plugin.properties.forEach(prop => {
                elementData.properties[prop.name] = prop.default
                if (plugin.properties) {
                    plugin.properties.forEach(prop => {
                        elementData.properties[prop.name] = prop.defaultValue;
                    });
                }
        
                currentProject.elements.push(elementData);
        
                return element;
            }
        
            function selectElement(element) {
                if (selectedElement) {
                    selectedElement.style.outline = 'none';
                }
                selectedElement = element;
                selectedElement.style.outline = '2px solid #007bff';
                updatePropertiesPane(element);
            }
        
            function updatePropertiesPane(element) {
                propertiesPane.innerHTML = '';
                const type = element.dataset.type;
                const category = element.dataset.category;
                const plugin = pluginLoader.getPlugin(category, type);
        
                addPropertyInput('X', element.style.left, (value) => { element.style.left = value; });
                addPropertyInput('Y', element.style.top, (value) => { element.style.top = value; });
                addPropertyInput('Width', element.style.width, (value) => { element.style.width = value; });
                addPropertyInput('Height', element.style.height, (value) => { element.style.height = value; });
                addPropertyInput('Background Color', element.style.backgroundColor, (value) => { element.style.backgroundColor = value; });
        
                if (plugin.properties) {
                    plugin.properties.forEach(prop => {
                        const elementData = currentProject.elements.find(el => el.type === type && el.x === element.style.left && el.y === element.style.top);
                        addPropertyInput(prop.name, elementData.properties[prop.name], (value) => {
                            elementData.properties[prop.name] = value;
                            prop.setValue(element, value);
                        });
                    });
                }
            }
        
            function addPropertyInput(label, value, onChange) {
                const container = document.createElement('div');
                container.innerHTML = `
                    <label>${label}: <input type="text" value="${value || ''}"></label>
                `;
                const input = container.querySelector('input');
                input.addEventListener('change', () => onChange(input.value));
                propertiesPane.appendChild(container);
            }
        
            function startDragging(e) {
                const element = e.target.closest('.canvas-element');
                let startX = e.clientX - element.offsetLeft;
                let startY = e.clientY - element.offsetTop;
        
                function moveElement(e) {
                    const newLeft = `${e.clientX - startX}px`;
                    const newTop = `${e.clientY - startY}px`;
                    element.style.left = newLeft;
                    element.style.top = newTop;
                    
                    const elementData = currentProject.elements.find(el => el.type === element.dataset.type && el.category === element.dataset.category && el.x === element.style.left && el.y === element.style.top);
                    if (elementData) {
                        elementData.x = newLeft;
                        elementData.y = newTop;
                    }
        
                    if (element === selectedElement) {
                        updatePropertiesPane(element);
                    }
                }
        
                function stopDragging() {
                    document.removeEventListener('mousemove', moveElement);
                    document.removeEventListener('mouseup', stopDragging);
                }
        
                document.addEventListener('mousemove', moveElement);
                document.addEventListener('mouseup', stopDragging);
            }
        
            function clearCanvas() {
                canvas.innerHTML = '';
            }
        
            function loadProjectToCanvas() {
                clearCanvas();
                currentProject.elements.forEach(el => {
                    const element = createCanvasElement(el.category, el.type, parseFloat(el.x), parseFloat(el.y));
                    canvas.appendChild(element);
                    
                    const plugin = pluginLoader.getPlugin(el.category, el.type);
                    if (plugin.properties) {
                        plugin.properties.forEach(prop => {
                            prop.setValue(element, el.properties[prop.name]);
                        });
                    }
                });
            }
        
            canvas.addEventListener('click', () => {
                if (selectedElement) {
                    selectedElement.style.outline = 'none';
                    selectedElement = null;
                    propertiesPane.innerHTML = '';
                }
            });
        });