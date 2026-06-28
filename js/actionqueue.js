class ActionQueue {

  constructor() {
    this.queue = []; //contains functions to run
    this.running = false;
  }

  //Used to add new functions to queue
  //Functions has to be wrapped in arrow functions
  //If there is a method with a delay a queued function, add "await"
  add(action) {
    this.queue.push(action);
     
    this.run();
  }
  
  //Method that runs everything in order
  async run() {
    if (this.running) return;

    this.running = true;
    g.inputLock = true

    while (this.queue.length > 0) {
      const action = this.queue.shift();
      await action(); // wait for completion
    }

    this.running = false;
    g.inputLock = false

    //Set idle animations after queue.
    runAnim(el("imgGirl"),`idle`)
  }

}