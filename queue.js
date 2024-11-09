class Queue {
    constructor() {
        this.items = [];
    }

    enqueue(item) {
        this.items.push(item);
    }

    dequeue() {
        if (this.isEmpty()) return 'Queue is empty';
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

class PriorityQueue {
    constructor() {
        this.items = [];
    }

    enqueue(item, priority) {
        if (this.isEmpty() || priority === false) {
            this.items.push(item);
        } else {
            let added = false;
            for (let i = 0; i < this.items.length; i++) {
                if (priority === true) {
                    this.items.splice(i, 0, item);
                    added = true;
                    break;
                }
            }
            if (!added) {
                this.items.push(item);
            }
        }
    }

    dequeue() {
        if (this.isEmpty()) return 'Priority queue is empty';
        return this.items.shift();
    }

    isEmpty() {
        return this.items.length === 0;
    }
}

module.exports = { Queue, PriorityQueue };
