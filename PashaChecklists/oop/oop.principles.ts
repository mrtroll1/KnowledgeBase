// DRY - Don't repeat yourself
    // Put functions/classes into one entity if methods do simillar things and operate on the same data

// KISS - Keep it simple, stupid
    // Use the simplest solution that meets the requirements
        // requirements != ['it should work']
        // requirements = ['it should work', 'it should be easy to read/change']
    // Do not use if oversimplifying is risky

// DRY vs KISS
    // Great way to reuse code is inheritance. But it adds a level of complexity.
    // Genrally, in OOP, the less code duplication, the more abstraction. Abstraction -> complexity

// YAGNI - You ain't gonna need it
    // Do not implement anything util it is needed
        // Avoid waste and maintenance burdens
    // Do not use if you actually need it

// OCP vs YAGNI 
    // There is no need to prefer polymorphism if you know that you are gonna add methods and not shapes

// SOLID - SRP, OCP, LSP, ISP, DIP
    // A class/module should have one reason to change
        // Isolate changes
    // Software entities should be open for extension, closed for modification
        // Add features the non-fragile way
    // Subtypes must be substitutable for their base types without breaking correctness
        // Safe polymorphism
    // Clients shouldn’t be forced to depend on methods they don’t use
        // Reduces coupling
    // High-level modules shouldn’t depend on low-level details; both should depend on abstractions.
        // Swappable implementations