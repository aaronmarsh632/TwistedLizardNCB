module.exports = {
    displayName: 'Checkbox',
    create() {
        const container = document.createElement('div');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        const label = document.createElement('label');
        label.textContent = 'Checkbox Label';
        container.appendChild(checkbox);
        container.appendChild(label);
        return container;
    },
    properties: [
        {
            name: 'Label Text',
            getValue(element) {
                return element.querySelector('label').textContent;
            },
            setValue(element, value) {
                element.querySelector('label').textContent = value;
            }
        },
        {
            name: 'Checked',
            getValue(element) {
                return element.querySelector('input[type="checkbox"]').checked;
            },
            setValue(element, value) {
                element.querySelector('input[type="checkbox"]').checked = value;
            }
        },
        {
            name: 'Font Size',
            getValue(element) {
                return element.querySelector('label').style.fontSize;
            },
            setValue(element, value) {
                element.querySelector('label').style.fontSize = value;
            }
        },
        {
            name: 'Text Color',
            getValue(element) {
                return element.querySelector('label').style.color;
            },
            setValue(element, value) {
                element.querySelector('label').style.color = value;
            }
        }
    ]
};
