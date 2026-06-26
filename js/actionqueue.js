class ActionQueue {
  constructor() {
    this.queue = [];
    this.running = false;
  }

  add(action) {
    this.queue.push(action);
    this.run();
  }

  async run() {
    if (this.running) return;
    this.running = true;

    while (this.queue.length > 0) {
      const action = this.queue.shift();
      await action(); // wait for completion
    }

    this.running = false;
  }
}