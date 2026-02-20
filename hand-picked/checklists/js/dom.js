// DOM - Document Object Model

// Find
    document.querySelector('any valid css selector'), document.querySelectorAll('...') // '#menu .item.active' // ':scope > .row:nth-child(2)'
    document.getElementById(), document.getElementsByClassName(), document.getElementsByTagName()

    element.firstElementChild(), element.lastElementChild(), element.parentElement();

// Create
    document.createElement('any valid html tag');
    document.createDocumentFragment() // a list of elements

    // nodes are unique, and childs act like sets
    ul.append(li);
    ul.append(li);
    ul.append(li);
    // ul will end up having only one li, instead we should
    ul.append(li.cloneNode(true)); // true for deep copy
    ul.append(li.cloneNode(true));
    ul.append(li); 

// Update
    element.textContent = '<b>Safe</b>' // renders literally
    element.innerHTML = '<b>Bold</b>' // parses HTML (risky if external)

    element.setAttribute('role', 'player'); element.getAttribute('role'); element.removeAttribute('role');

    element.id; element.dataset.anyKey;

    element.classList
        .add()
        .remove()
        .toggle()
        .contains()

// Remove
    element.remove()
    element.parentElement.removeChild(element) // legacy

// DOM is expensive
    // Flow: Style -> Layout -> Paint -> Composite. Hence the expensiveness hierarchy
    // Layout (reflow): recalcule element sizes/positions, anything that affects layout (width, margin, padding, position, font-size)
    // Drawing pixels (repaint): colors, borders, shadows, images (color, bg, box-shadow, border, text-decoration)
    // Composite: transform, opacity

    // Batch READS then WRITES
        // BAD: interleaving reads & writes in a loop
            for (const el of els) {
                el.style.width = el.offsetWidth + 10 + 'px'; // write then read forces layout each time
            }
        
        // GOOD: gather reads first, then write
            const widths = els.map(el => el.offsetWidth);         // READ
            els.forEach((el, i) => { el.style.width = widths[i] + 10 + 'px'; }); // WRITE

    // Use requestAnimationFrame for visual work

    // Prefer transforms & opacity for motion
        // Animate with transform: translate/scale/rotate and opacity.
        // Avoid animating layout (top/left, width/height, margin) in smooth animations.

    // Build nodes in a DocumentFragment or <template>; insert once.

    // Render only what’s visible (virtual scrolling).