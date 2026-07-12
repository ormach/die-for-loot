NO NEW FEATURES UNTIL RELEASE
+ Button transitions main.
+ Clear shake on non table active items.
- Notification stacking


Design issues

Bugs
- CLick to move pattern : if die cost does not match and it 
- If 2 frogs, pliers + crown combo does not work.
- Gemdice + frog is not working.


Concepts
- Some bonus effect when you clear 4-6 items per turn.
- "+1 ghost die" instead of "gain 1", a special die that you can move on another die to increase it.
- Create spritesheet with dice rotation.
- Add game method to rearrange the dice.
- Passive: If die roll value exceeds 6, get excess as a separate die.
- If too many bricks force active items.



//For drag and drop
        // if(ev.target.classList.contains('card')){
        //     // ev.target.parentNode.insertBefore(document.getElementById(data), ev.target);
        // }
        // // Duplicates per container in card
        // else if (ev.target.parentNode.parentNode.classList.contains('card')){
        //     overlappingCard = ev.target.parentNode.parentNode
        //     targetContainer = ev.target.parentNode.parentNode.parentNode
        // }
        // // If elem in card
        // else if (ev.target.parentNode.classList.contains('card')){
        //     overlappingCard = ev.target.parentNode
        //     targetContainer = ev.target.parentNode.parentNode
        // }
        // else{
        //     targetContainer = ev.target
        // }