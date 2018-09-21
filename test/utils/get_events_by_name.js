// resolves array of event logs matching the event name

module.exports = (contractInstance, eventName) => {
  return new Promise((resolve, reject) => {
    const event = contractInstance[eventName]();
    event.watch();
    event.get((err, logs) => {
      const ret = logs.filter(l => l.event === eventName);
      if (!ret || !ret.length) {
        reject("No event logs with that name");
      } else {
        resolve(ret);
      }
    });

    event.stopWatching();
  });
};