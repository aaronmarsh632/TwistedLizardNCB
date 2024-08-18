module.exports = {
    displayName: 'Text',
    create() {
        const div = document.createElement('div');
        div.textContent = 'Text';
        return div;
    },
    properties: [
        {
            name: 'Content',
            getValue(element) {
                return element.textContent;
            },
            setValue(element, value) {
                element.textContent = value;
            }
        }
    ]
};
