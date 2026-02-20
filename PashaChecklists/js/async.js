// Event loop
    // Sync (call stack), microtasks (promises, queueMicrotask), macrotasks (timeouts, DOM events, network callbacks)

const { promisify } = require("util");

    // current stack → microtasks → next macrotask
    console.log('A');

    setTimeout(() => console.log('D'), 0);

    Promise.resolve().then(() => console.log('C'));

    console.log('B');
    // This will return A - B - C - D
        // first the call stack (sync tasks)
        // then do everything from microtask queue
        // then go on to next macrotask

    // Similarly
    console.log('A');

    const data = fetch('...').then(res => res.json()).then(data => console.log(data)); 

    console.log('C')
    // This will return A - C - data

    console.log('A');

    const newData = await fetch('...');
    console.log(data);
    
    console.log('C');
    // This will return A - data - C, 
    // That's why we use await - to pause the current async function, which will resume in this microtask whne the promise settles

// Promise - placeholder for a value that might be available later
    // Three states: pending, fulfilled (resolved with a value), rejected (failed with a reason).
    // .then(onFulfilled) (returns a new promise)
    // .catch(onRejected) (also returns a new promise)
    // .finally(onFinally) (runs regardless; doesn’t receive the value)

    // .resolve, .reject, .all, .race, ... 

    const p = new Promise((resolve, reject) => {
        // do something async...
    });
      

// Promisifying
    // Most old-school Node APIs take a (err, result) => { ... } shaped callback. 
    // We can convert them into functions that retursn a promise (se we can use .then/.catch or async/await). 
    // Instead of 
    const handleReadFile = (error, result) => {
        if (error) {
            console.error(error);
            return;
          }
        console.log('Result: ', result);
    }

    fs.readFile('notes.txt', 'utf8', handleReadFile);

    // we do
    const readFileAsync = promisify(fs.readFile);

    try {
        const result = await readFileAsync('notes.txt', 'utf8');
        console.log(result);
      } catch (e) {
        console.error('Failed:', e);
    }