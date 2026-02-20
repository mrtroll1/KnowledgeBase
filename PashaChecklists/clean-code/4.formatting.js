// Formatting - Chapter 5 from Robert Martin's Clean Code

// The newspaper metaphor
    // Newspaper is a composition of many articles, each rather small relative to the size of them combined: 
        // so should be a module
    // Article is a composition of paragraphs, structured hierarchically: so should be a file

// Vertical openness between concepts
    // Conceptually different blocks of code should be separated by a line

// Vertical density
    // Tightly related bits of code should appear together

// Vertical distance
    // The more important is one to understand the other, the smaller vertical distance between them should be

// Vertical ordering
    // if function / method A calls function / method B from the same file, A should appear higher