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
            
            let cardObj = findByProperty(g.table, "itemId", targetCard.id)
            
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

            this.itemsPerTurn = confirm.itemsPerTurn
        }

        //Update html based on game state
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
            //Clear dice before card onMove fx.
            this.clearDice()
            g.itemsPerTurn = config.itemsPerTurn
            
            //Reset table items & flags
            g.table.forEach(item => {
                item.setFlags()
                
                //Reset shake, uses
                item.updateHtml()
            })
            

            //TRIGGER : turnEnd
            g.table.forEach(item => {
                if(item.effectType !== "turnEnd") return
                item.fx()
            })
    

            //REVEAL 4 ITEMS
            this.reveal(this.itemsPerTurn)
            

            //ROLL DICE
            this.addMultipleDice(config.turnDice)


            //TRIGGER : turnStart : item effect that activate at the start of the turn
            g.table.forEach(item => {
                if(item.effectType.includes("turnStart")){   
                    item.fx()
                }
            })

            this.turnCounter++
            this.updateUI()
        }

        //Moves item from pile to table, if no space voids it.
        reveal(quant){
            if(this.pile.length >= quant){
                for(let i = 0; i < quant; i++){
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


            //Pile hits 0 => Last turn
            if(this.pile.length === 0){
                el('turnBtn').setAttribute('onclick', 'g.gameOver()')
                
                el('turnBtn').innerHTML = `
                    End game 
                    <span style="opacity: 0.5;">(space)</span>
                `

                el('turnBtn').classList.add("endRunBtn")
            }
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
        addMultipleDice(quant, args){
            for(let i = 0; i < quant; i++){
                new Die(args)
            }
        }

        gameOver(){
            if(this.pile.length < 1){
                console.log("Game over");

                //Calc score
    
                let runOutcome 
                let total = g.cardsRef.length
                let diamond = Math.floor(total * 0.90)
                let golden = Math.floor(total * 0.80)
                let silver = Math.floor(total * 0.70)

                if(g.bag.length >= diamond){
                    runOutcome = "Diamond"
                }
                else if (g.bag.length >= golden){
                    runOutcome = "Golden"
                }
                else if (g.bag.length >= silver){
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
                        Items in void: ${g.void.length} <br>
                        Turns: ${g.turnCounter}<br><br>

                        Total items: ${total}<br>
                        Diamond run: ${diamond}<br>
                        Golden run: ${golden}<br>
                        Silver run: ${silver}<br>
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

        //MODE manager
        selectionMode(args){
            //args = {
            //  location:"dice", 
            //  sourceItem: obj
            //  mode: "exit" / "enter"
            //}

            // Dice selection mode
            if(args.location === "dice"){
                el('selectionShade').classList.remove('hide') //toggle shade
                g.mode = args.location

                g.dice.forEach(die =>{
                    //Dice animations
                    die.htmlElem.classList.remove('spin')
                    die.htmlElem.classList.add('selection', 'shake', 'clickable')

                    g.activeItem = args.sourceItem //Store active item for reference in effect method
                    // die.htmlElem.addEventListener("click", returnTarget) //Add event listener that stores clicked element
                })
            }

            // Item selection mode
            else if(args.location === "table"){
                console.log("Enter mode");
                
                el('selectionShade').classList.remove('hide') //toggle shade
                g.mode = args.location

                g.table.forEach(item =>{
                    //Remove event listener
                    item.htmlElem.classList.add('selection', 'shake', 'clickable')

                    g.activeItem = args.sourceItem //Store active item for reference in effect method
                    // item.htmlElem.addEventListener("click", returnTarget) //Add event listener that stores clicked element
                })
            }

            // Exits mode
            else if(args.mode !== undefined && args.mode === "exit"){
                el('selectionShade').classList.add('hide') //toggle shade

                if(g.mode === "dice"){
                    g.dice.forEach(die =>{die.clearSelectionMode()})
                }
                else if (g.mode === "table"){
                    g.table.forEach(item =>{item.clearSelectionMode()})
                }

                g.mode = false
                g.targets = []
                                
            }
        }
    }

    //Event listeners
    //Return clicked elem via listener. 
    //Has to be separate & named, can't remove arrow function listener
    // function returnTarget(event){g.activeItem.fx(["target", event.target])}


//START GAME
    let g //global game variable
    let cardsRef //required here due to fetch

    function startGame(){
        g = new Game
        
        //Generate all items
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

        //Misc
        g.updateUI()
        g.nextTurn()

        //Keyboard listener
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

    //Event queue
    const actionQueue = new ActionQueue();

    const pause = ms => new Promise(resolve => setTimeout(resolve, ms));
    
    //async fucntion with delay
    async function run() {
        for (let i = 0; i < 4; i++) {
            new Die
            
            await pause(500);
        }
    }

    //event queue
    function queue(){
        actionQueue.add(() => {
            
                // new Die
                run()
                console.log("event queue test")
            
        });
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