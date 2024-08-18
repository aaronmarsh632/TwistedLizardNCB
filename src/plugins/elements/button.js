module.exports = {
    displayName: 'Button',
    create() {
        const button = document.createElement('button');
        button.textContent = 'Button';
        return button;
    },
    properties: [
        {
            name: 'Text',
            getValue(element) {
                return element.querySelector('button').textContent;
            },
            setValue(element, value) {
                element.querySelector('button').textContent = value;
            }
        },
        {
            name: 'Font Size',
            getValue(element) {
                return element.querySelector('button').style.fontSize;
            },
            setValue(element, value) {
                element.querySelector('button').style.fontSize = value;
            }
        },
        {
            name: 'Text Color',
            getValue(element) {
                return element.querySelector('button').style.color;
            },
            setValue(element, value) {
                element.querySelector('button').style.color = value;
            }
        }
    ]
};
