require('@testing-library/jest-dom');

global.HTMLElement.prototype.scrollIntoView = jest.fn();

global.createHTMLElement = (html) => {
    const div = document.createElement('div');
    div.innerHTML = html.trim();
    return div.firstChild;
};