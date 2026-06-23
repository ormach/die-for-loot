//DRAG AND DROP
//Requires any ID for draggable elem
    let draggedElement
    let overlappingCard
    let targetContainer

    function allowDrop(ev) {
        ev.preventDefault();
    }

    //MOVE element
    function drag(ev) {
        //Record dragged element
        draggedElement = ev.target //logs picked element

        //Records dragged element data to pass to drop(ev)
        ev.dataTransfer.setData("text/plain", ev.target.id);

        // console.log(ev.target.classList[0], ev.target.id, ev.target.dataset.rollvalue);
    }

    //DROP element
    function drop(ev) {
        ev.preventDefault();
        

        //Record target elem
        //Prevents card to be added inside of a card.
        //If target elem is card, change target to cards container
        if(ev.target.classList.contains('card')){
            overlappingCard = ev.target
            targetContainer = ev.target.parentNode
            // ev.target.parentNode.insertBefore(document.getElementById(data), ev.target);
        }
        // Duplicates per container in card
        else if (ev.target.parentNode.parentNode.classList.contains('card')){
            overlappingCard = ev.target.parentNode.parentNode
            targetContainer = ev.target.parentNode.parentNode.parentNode
        }
        // If elem in card
        else if (ev.target.parentNode.classList.contains('card')){
            overlappingCard = ev.target.parentNode
            targetContainer = ev.target.parentNode.parentNode
        }
        else{
            targetContainer = ev.target
        }
        

        //Add card to container
        targetContainer.appendChild(draggedElement);


        //Do stuff on card placement
        //Update card location

        //Target element id
        let targetCard = ev.target.closest(".card")                

        //EVALUATE costs
        //Gets data from drag(), (transfers id)
        var data = ev.dataTransfer.getData("text/plain");
        let activeDie = el(data)

        // console.log(`
        //     Roll value: ${activeDie.dataset.rollvalue}  
        //     Target element:( ${targetCard.id} | ${ev.target.dataset.cost} )
        // `);
        
        //Compare dice cost
        if(activeDie.dataset.rollvalue == targetCard.dataset.cost){
            console.log('Cost paid');

            //Replace with move
            //Find card object by id
            // console.log(targetCard.id);
            
            let cardObj = findByProperty(g.table, "cardId", targetCard.id)
            
            // cardObj.moveCard(targetCard, `bag`)
            activeDie.remove()

            //Move card to bag
            cardObj.moveCard("bag")
        }else{
            el("dice").appendChild(draggedElement)
        }

    }

    //Make base elem invisible during drag and drop
    function fixDrag(elem){
        elem.addEventListener('dragstart', (e) => {
            e.dataTransfer.setDragImage(elem, elem.offsetWidth / 2, elem.offsetHeight / 2);
    
            // Hide original after drag begins
            setTimeout(() => {
                elem.style.visibility = 'hidden';
            }, 0);

            // const preview = document.getElementById("imgGirl");
            // e.dataTransfer.setDragImage(preview, 50, 50);
        });
        
        elem.addEventListener('dragend', () => {
            elem.style.visibility = '';
        });
    }
    




//GAME & UI
    class Game {
        constructor(){
            this.cardsRef = [] //Stores initial card data from csv
            this.cards    = [] //Stores generated cards with html and extra props
            this.dice     = []

            this.pile     = []
            this.table    = []
            this.void     = []
            this.bag      = []

            this.turnCounter = 0
            this.targets  = []
        }

        //Regen html based on game state
        updateUI(){
            el(`voidBtn`).innerHTML = `
                Void (${g.void.length})
            `

            el(`bagBtn`).innerHTML = `
                Bag (${g.bag.length}/30)
            `

            el(`pileBtn`).innerHTML = `
                Pile (${g.pile.length})
            `
        }

        //Turn
        nextTurn(){

            //RESETS
            //Clear dice before card fx that trigger on movement.
            this.clearDice()

            //Reset table items & flags
            g.table.forEach(item => {
                item.setFlags()

                //Reset shake
                if(item.effectType === "onClick"){
                    item.htmlElem.childNodes[1].classList.add('shake')
                }
            })

    
            //REVEAL
            //Move 4 items to the table            
            if(this.pile.length > 3){
                for(let i = 0; i < 4; i++){
                    rarr(this.pile).moveCard("table")
                }
            }
            //Moves remaining items
            else if(this.pile.length > 0 ){
                let remainingCards = this.pile.length

                for(let i = 0; i < remainingCards; i++){                    
                    rarr(this.pile).moveCard("table")
                }
            } 
            //Game over
            else{
                this.gameOver()
            }
            //Recolor next turn button for final turn
            if(this.pile.length === 0){
                
                el('turnBtn').innerHTML = `
                    End game 
                    <span style="opacity: 0.5;">(space)</span>
                `

                el('turnBtn').classList.add("endRunBtn")
            }
            
            //ROLL DICE
            for(let i = 0; i < config.turnDice; i++){new Die}


            //TURN START EFFECTS
            //Passive: item effect that activate at the start of the turn
            g.table.forEach(item => {
                if(item.effectType.includes("turnStart")){   
                    item.fx()
                }
            })

            this.turnCounter++
            this.updateUI()
        }

        //Clear dice
        clearDice(){
            g.dice = []
            el("dice").innerHTML = ``
        }
        mergeDice(arg){
            let newRollValue = arg[0].value + arg[1].value
            if (newRollValue > 6){newRollValue = 6}
            
            //Delete initial ones
            arg.forEach(die =>{
                die.delete()
            })

            //Generate a new one with combined roll value
            new Die({value:newRollValue})
        }

        gameOver(){
            if(this.pile.length < 1){
                console.log("Game over");

                //Calc score
    
                let runOutcome 

                if(g.bag.length > 34){
                    runOutcome = "Diamond"
                }
                else if (g.bag.length > 29){
                    runOutcome = "Golden"
                }
                else if (g.bag.length > 25){
                    runOutcome = "Silver"
                }
                else{
                    runOutcome = "Failed"
                }

                el('gameOver').innerHTML = `
                    <h1 id="endTitle">
                        Game over.<br>
                        You had a <span style="color:white;">${runOutcome}</span> run.
                    </h1>

                    <p id="score">
                        Items in bag: ${g.bag.length} <br>
                        Turns: ${g.turnCounter}<br><br>

                        Diamond run: 35<br>
                        Golden run: 30<br>
                        Silver run: 25<br>
                    </p>

                    <button onclick="location.reload()">Play again</button>
                `

                // later

                document.removeEventListener('keydown', keyHandler);
                document.addEventListener('keydown', newKeyHandler);

                toggleModal("gameOver")

                return true
            }            
        }

        selectionMode(arg){

            // Enters mode
            if(arg[0] === "dice"){
                el('selectionShade').classList.remove('hide') //toggle shade
                g.mode = "diceSelection"

                g.dice.forEach(die =>{
                    //Dice animations
                    die.htmlElem.classList.remove('spin')
                    die.htmlElem.classList.add('selection', 'shake', 'clickable')

                    g.activeItem = arg[1] //Store active item for reference in effect method
                    die.htmlElem.addEventListener("click", returnTarget) //Add event listener that stores clicked element
                })
            }

            // Exits mode
            if(arg[0] === "exit"){
                el('selectionShade').classList.add('hide') //toggle shade
                g.mode = false
                
                //Same thing should work for items and dice
                if(g.mode === "diceSelection") return
                                
                g.dice.forEach(die =>{
                    die.clearSelectionMode()
                })
            }
        }
    }
    // Return clicked elem via listener. Has to be separate & named, can't remove arrow function listener
    function returnTarget(event){g.activeItem.fx(["target", event.target])}


//DIE
    class Die {
        constructor(arg){

            if(arg === undefined){
                this.setRollValue(rng(6,1))
            }else {
                this.setRollValue(arg.value)
            }


            this.dieId = genId('di')
            
            this.genDieHtml()
            g.dice.push(this)

            // console.log(g.dice);
        }

        //Adds die html element to #dice
        genDieHtml(){
            let die = document.createElement('div')
            
            die.id = this.dieId
            die.classList = `die die${this.value}`
            die.setAttribute('draggable','true')
            die.setAttribute('ondragstart','drag(event)')
            die.setAttribute('data-rollvalue', this.value)
            
            el('dice').append(die)
            this.htmlElem = die
            this.spinAnim()
            // this.setPosition()

            fixDrag(die) //Removes the base image during drag and leaves the projection
        }

        //Trigger spin animation
        spinAnim(){
            this.htmlElem.classList.remove("spin");
            void el.offsetWidth; // force reflow so browser "resets" animation
            this.htmlElem.classList.add("spin");
        }

        delete(){
            this.htmlElem.remove()
            removeFromArr(g.dice, this)
        }
        setRollValue(val){
            this.value = val

            //Passive: item effect when die roll value is set
            g.table.forEach(item => {
                if(
                       item.effectType !== "onClick" 
                    && item.effectType !== "turnStart"
                    && item.effectType !== "onMove"
                ){
                    item.fx(this)        
                }
            })

            //Update html
            if(this.htmlElem === undefined) return
            this.htmlElem.classList = `die die${this.value}`
            this.htmlElem.setAttribute('data-rollvalue', this.value)
        }
        setPosition(){
            // Image & position
            let diePosition = {x: 0, y: 0}
            let diceInHand = el("dice").childNodes.length
            let diceOffset = 68

            diePosition.y = diceInHand * diceOffset

            if(diceInHand > 3){
                diePosition.x = diceOffset
                diePosition.y = (diceInHand - 4) * diceOffset
            }
            if(diceInHand > 7){
                diePosition.x = diceOffset * 2
                diePosition.y = (diceInHand - 8) * diceOffset
            }

            this.htmlElem.setAttribute('style',`
                bottom: ${diePosition.y}px;
                left: ${diePosition.x}px;
            `) 
        }
        clearSelectionMode(){
            //Dice animations
            this.htmlElem.classList.add('spin')
            this.htmlElem.classList.remove('selection', 'shake', 'clickable')

            //Remove eventlistener
            this.htmlElem.removeEventListener("click", returnTarget)
        }

        //Items
        moveItem(location, item){
        
            //Target item
            //Where
        }

        //Dice
        split(){
            let split = [1,1]

            if(this.value > 1){
                split[0] = Math.floor(this.value / 2)
                split[1] = this.value - split[0]
            }
            
            new Die({value: split[0]})
            new Die({value: split[1]})

            this.delete()

        }
        duplicate(){
            new Die({value: this.value})
        }
        multiply(){
            let newValue = this.value * 2
            if(newValue > 6){newValue = 6}
            this.setRollValue(newValue)
        }
        reroll(){
            this.setRollValue(rng(6,1))
        }  
    }


//ITEM
    class Card {
        constructor(args){
            
            // console.log(args);
            let newCardName = args.name

            //Find card reference in ref object
            this.cardRefObj = findByProperty(g.cardsRef, 'name', newCardName)                                    

            //Set props
            this.cardId = genId('cr')
            this.location = args.location //stores id of location elem
            this.name   = this.cardRefObj.name
            this.effect = this.cardRefObj.effect //rename to effectDescription
            this.effectType = this.cardRefObj.effectType
            this.type   = this.cardRefObj.type
            this.cost   = this.cardRefObj.cost 

            this.setFlags()

            //Adds card function to the card
            this.fx = itemEffectRef[this.name]
            //Sets blank if no function is defined
            if(itemEffectRef[this.name] === undefined){this.fx = function empty() {}}
            
            //Generate html elem
            this.genHtml()
            
            //Append html element to location  
            this.moveCard(args.location)
            
        }
        setFlags(){
            this.flags  = {...config.flags} //spread breaks ref with config object to avoid changing all instances

            if(this.cardRefObj.uses !== ""){
                this.flags.uses = this.cardRefObj.uses
            }
        }

        //Returns card html element
        genHtml(){
            let card = document.createElement('div')
            let cardImg = this.name
            
            card.id = this.cardId
            card.classList = 'card'
            // card.setAttribute('draggable','true')
            // card.setAttribute('ondragstart','drag(event)')
            card.setAttribute('ondrop','drop(event)')
            card.setAttribute('ondragover','allowDrop(event)')
            card.setAttribute('data-cost', this.cost)      
            
            //IMG management
            let img = this.name
            if(this.cardRefObj.img !== "y"){img = "default"}
            let imgString = `<img class="itemImg" src="./img/items/id=${img}.png">`

            //Adds on click event for html elem, click => onclick event not listener id
            if(this.effectType === "onClick"){
                card.addEventListener("click", () => {this.fx("used")})
                card.classList.add('clickable')
                imgString = `<img class="itemImg shake" src="./img/items/id=${img}.png">`
            }

            //Hide effect description if blank
            let description = `
                <div class="card-data">
                    <p>${this.effect}</p>
                </div>
            `
            if(this.effect === ""){
                description = `<div style="height:60px"></div>`
            }

            card.innerHTML = `
                    ${imgString}

                    <div class="props">
                        <p>${upp(this.type)}</p>
                        <img class="cost" src="./img/die/id=${this.cost}.svg"></img>
                    </div>

                    ${description}
            `

            //Store html elem in obj
            this.htmlElem = card
            return card
        }

        moveCard(locationId){

            let refCard = this //Store card obj to delete the initial one
            let tableSlot
            
            removeFromArr(g[this.location], this) //Remove initial card obj
            refCard.location = locationId //Store location, it changes below

            //Find empty table slot or void              
            if(locationId === "table"){

                //Loop from slot 1.
                let i = 1;
                let placed = false

                while (placed == false) {

                    //Void a card if loop checked all slots.
                    if(i == 7){
                        locationId = "void"
                        refCard.location = "void"
                        placed = true
                        i = 6
                    }

                    //Check if slot has a child element.
                    if(el(`${i}`).childNodes.length == 0){
                        locationId = `${i}` //If slot is empty, set location
                        placed = true
                    }

                    i++;
                }
            }

            //Move card obj to appropriate game array
            g[refCard.location].push(refCard)

            //Move html to table slot or containers
            if(locationId === "table"){
                el(tableSlot).append(refCard.htmlElem)
            } 
            else{
                el(locationId).append(refCard.htmlElem)
            }

            //Check for movement fx triggers
            if(this.effectType.includes("onMove")){this.fx()}

            g.updateUI()
        }

        checkConditions(args){
            let pass = true
            
            //Check location 
            if(args.reqLocation !== undefined && this.location !== args.reqLocation) pass = false

            //Check use charges
            if(args.uses !== undefined && this.flags.uses === 0) pass = false
            
            //Check if it was clicked TBA

            console.log(`${this.name} — activation conditions passed: ${pass}`)
            return pass
        }

        endEffect(args){
            //Remove css wiggle
            if(args.uses) this.flags.uses--

            //Resets target storage 
            g.targets = []

            if(this.flags.uses === 0){
                this.htmlElem.childNodes[1].classList.remove("shake")
            }
        }
    }

    let itemEffectRef = {
        //On move
        wallet(){
            if(!this.checkConditions({reqLocation: "table"})) return
            new Die
        },

        //Passive (on roll value set)
        taxes(arg){
            if(!this.checkConditions({reqLocation: "table"}) || arg === undefined) return
            
            if(arg.value === 6){
                arg.value = 3
            }
        },
        hammer(){
            if(!this.checkConditions({reqLocation: "table"})) return

            g.table.forEach(item => {
                if(item.flags.uses > 0){            
                    item.flags.uses++
                }
            })
            
        },

        //Active
        ball(arg){
            if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
            new Die
            this.endEffect({uses: true})            
        },
        saw(arg){

            //Handles returned die
            if(arg !== undefined && arg[0] === "target"){

                //Finds object by html id
                let target = findByProperty(g.dice, "dieId", arg[1].id)

                target.split()
                
                g.selectionMode(['exit'])
                this.endEffect({uses: true})
            }

            //Initiates selection mode
            if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
            g.selectionMode(['dice', this])
        },
        calculator(arg){

            //Handles returned die
            if(arg !== undefined && arg[0] === "target"){

                //Finds object by html id
                let target = findByProperty(g.dice, "dieId", arg[1].id)

                target.multiply(2)
                
                g.selectionMode(['exit'])
                this.endEffect({uses: true})
            }

            //Initiates selection mode
            if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
            g.selectionMode(['dice', this])
        },
        cloner(arg){

            //Handles returned die
            if(arg !== undefined && arg[0] === "target"){

                //Finds object by html id
                let target = findByProperty(g.dice, "dieId", arg[1].id)

                target.duplicate()
                
                g.selectionMode(['exit'])
                this.endEffect({uses: true})
            }

            //Initiates selection mode
            if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
            g.selectionMode(['dice', this])
        },
        tower(arg){

            //Handles returned die
            if(arg !== undefined && arg[0] === "target"){

                //Finds object by html id
                let target = findByProperty(g.dice, "dieId", arg[1].id)

                target.reroll()
                
                g.selectionMode(['exit'])
                this.endEffect({uses: true})
            }

            //Initiates selection mode
            if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
            g.selectionMode(['dice', this])
        },
        chisel(arg){

            //Handles returned die
            if(arg !== undefined && arg[0] === "target"){

                //Finds object by html id
                let target = findByProperty(g.dice, "dieId", arg[1].id)

                console.log(target);
                
                let newValue = target.value - 1

                target.setRollValue(newValue)
                
                g.selectionMode(['exit'])
                this.endEffect({uses: true})
            }

            //Initiates selection mode
            if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
            g.selectionMode(['dice', this])
        },
        glue(arg){
            
            //Select 1st die.
            if(arg !== undefined && arg[0] === "target"){

                //Finds object by html id
                let target = findByProperty(g.dice, "dieId", arg[1].id)
                target.clearSelectionMode()
                g.targets.push(target)
            }

            //Select 2nd die.
            if(g.targets.length === 2){

                g.mergeDice(g.targets)
                
                g.selectionMode(['exit'])
                this.endEffect({uses: true})
            }

            //Initiates selection mode
            if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
            g.selectionMode(['dice', this])
        },
        slots(arg){
            if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
            let die = new Die

            console.log(die.value);
            if(die.value > 3){

            }
            
            //Eval roll value
            this.endEffect({uses: true})   
        }
    }





//START GAME
    let g //global game variable
    let cardsRef //required due to fetch

    function startGame(){
        g = new Game
        
        //Add cards to game obj
        cardsRef.forEach(card =>{
            if(card.hide !== "y"){
                g.cardsRef.push(card)

                //Add card to pile
                new Card({
                    "name": card.name,
                    "location":"pile",
                    "effect": "effect",
                    "cost": "cost",
                }) 
            }
        }) 

        //Load/generate game
        g.updateUI()
        g.nextTurn()

        document.addEventListener('keydown', keyHandler);
    }
    
    //KEYBOARD
    function keyHandler(event) {
        if (event.code === 'Space') {
            g.nextTurn();
        } 
        else if (event.code === 'KeyB') {
            toggleModal('bagModal');
        } 
        else if (event.code === 'KeyV') {
            toggleModal('voidModal');
        }
    }
    function newKeyHandler(event) {
        if (event.code === 'Space') {
            location.reload()
        } 
    }




//Fetch csv file, parse to JSON, assign it to ref obj
    fetch('./items.csv')
        .then(response => response.text())
        .then(
            csvText  => {
                cardsRef = JSON.parse(csvJSON(csvText))
                return cardsRef
            }
        )
        .then(
            () => startGame()
        )
        .catch(error => console.error('Error:', error))