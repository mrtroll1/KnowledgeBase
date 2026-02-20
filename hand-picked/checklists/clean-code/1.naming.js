// Naming - Chapter 2 from Robert Martin's Clean Code

// Names should convey intentions of the developer
    // isLastDayOfWeek vs isSunday

// Avoid misinformation
    function saveObject(object) {
        object.prop.modify()
        // save the object
    }

// Use meaningful distinctions 
    //getUserData is worse than getUser or getUserDTO

// Use names that are simple to pronounce
    // Clean code is about verbal communication too

// Use names that are simple to look-up
    // Search for base.py returns 15 files

// Avoid encodings
    // Using encodings + new devs = danger + waste of time on lecturing

// Avoid Mental mapping
    // Why do int d = 30 when you can do int daysInJune = 30?

// Use nouns for classes and verbs/verb-phrases for methods

// Don't be cute, Avoid puns
    // Convention & Clarity > Novelty & Ambiguity

// Pick one word per concept
    // userData = userInfo = user - total mess

// Use solution-domain vocabulary
    // DDD

// Use problem-domain vocabulary
    // Clean code is also about communication with clients

// Add meaningful context
    const number = 10 // useless name

// Avoid superfluous context
    user.usersEmailAdress // non-sensical field
    

