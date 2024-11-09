class Stack {
    constructor() {
        this.items = [];
    }

    push(item) {
        this.items.push(item);
    }

    pop() {
        if (this.isEmpty()) return 'Stack is empty';
        return this.items.pop();
    }

    peek() {
        if (this.isEmpty()) return 'Stack is empty';
        return this.items[this.items.length - 1];
    }

    isEmpty() {
        return this.items.length === 0;
    }

    getAll() {
        return this.items;
    }
}

module.exports = Stack;
