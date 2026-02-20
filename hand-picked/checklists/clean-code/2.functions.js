// Functions - Chapter 3 from Robert Martin's Clean Code

// Functions should be compact
    // 10 lines max

// Functions should do one thing
    function sendMessage(title, mainText, recipient) {
        const messageHtml = title + mainText;
        gmailGateway.send(recipient, messageHtml);
    }
    // vs
    function sendEmail(messageHtml, recipient) {
        gmailGateway.send(recipient, messageHtml);
    }
    function composeEmail(title, mainText) {
        return title + mainText;
    }

// One level of abstraction per function
    // Classes A and C belong to the same level of abstraction of there exists no object b of class B, and no objects a and 
    // of classes A and C respectively such that
        // c can be manipulated by a through b or a can be manipulated by c through b.

// Reading from top to bottom
    // The further in the file, the lower the abstraction level and the higher the level of detalization. 

// Function arguments
    function appendZhopa(listOfBodyparts) {
        listOfBodyparts = [...listOfBodyparts, 'zhopa']
    } 
    // vs
    function listOfBodypartsExtendedWith(element) {
        return [...listOfBodyparts, element]
    }

    // Avoid flag arguments 

    // Use argument objects

    // Use keywords
        assertEquals(expected, actual) // or actual, expected ??? 
        //vs 
        assertExpectedEqualActual()

// Functions should not have any side effects
    function composeEmail(title, mainText) {
        messageHtml = title + mainText;
        messageHtml.saveToDB()
        return messageHtml
    } // this is bad. who told us we were saving anything?

// Command Query Separation
    // Function should either do something or answer something
    function checkStatus(payment) {
        // if payment.status == 'FAILED' {
            // retry
        // } 
    } // this is bad. 

// Do not repeat yourself
    // Structure your code so that functions are re-usable, avoid duplication

// Structured Programming
    // single return, no breaks and no continues


// Difference between 1. Convey dev's intention / 2. Do One Thing / 3. One Level of Abstraction / 4. No Side Effects
    // 1, 2, 3 - good; 4 - bad
    function prepareDataForOutput(dataObject) {
        const outputTransformer = config.getOutputTransformer()
        outputTransformer.transform(dataObject)
    }

    // 2, 3, 4 - good; 1 - bad
    function visualize(text) {
        const outputStream = config.getOutputStream()
        outputStream.push(text)
    } 

    // 1, 3, 4, -- good; 2 - bad
    function showOutput(text) {
        const outputTransformer = config.getOutputTransformer()
        const cleanedText = outputTransformer.transform(text)

        const outputStream = config.getOutputStream()
        outputStream.push(cleanedText)
    } 

    // 1, 2, 4 - good; 3 - bad
    function prepareTextForOutput(text) {
        const outputTransformer = config.getOutputTransformer()
        const cleanedText = outputTransformer.transform(text)

        return toLowerCase(cleanedText);
    }
