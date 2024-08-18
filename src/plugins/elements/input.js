module.exports = {
    displayName: 'Input',
    create() {
        return document.createElement('input');
    },
    properties: [
        {
            name: 'Placeholder',
            getValue(element) {
                return element.querySelector('input').placeholder;
            },
            setValue(element, value) {
                element.querySelector('input').placeholder = value;
            }
        }
    ]
};
