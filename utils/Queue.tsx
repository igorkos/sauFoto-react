export class Queue {
    private elements: any[];
    constructor(...elements) {
        // Initializing the queue with given arguments
        this.elements = [...elements];
    }
    // Proxying the push/shift methods
    push(...args) {
        return this.elements.push(...args);
    }

    head() {
        if (length > 0) {
            return this.elements[0]
        } else {
            return null
        }
    }

    shift() {
        return this.elements.shift();
    }
    // Add some length utility methods
    get length() {
        return this.elements.length;
    }

    set length(length) {
        this.elements.length = length;
    }
}
