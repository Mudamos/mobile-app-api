class Factory {

  constructor() {
    this.registeredTypes = new Map()
  }
  register(className, object) {
    if (!(this.registeredTypes.has(className))) 
      this.registeredTypes.set(className, object);
    else 
      throw new Error("Type already registered")
  }

  create(className, ...options) {
    if (!this.registeredTypes.has(className)) 
      return null;

    let object = this.registeredTypes.get(className);
    let instance = new object(...options);

    return instance;
  }
}

module.exports = Factory;
