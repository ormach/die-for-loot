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

        
        //PAY: Compare dice cost
        if(
               activeDie.dataset.rollvalue > 6
            && activeDie.dataset.rollvalue >= targetCard.dataset.cost 
        ){
            findByProperty(g.table, "itemId", targetCard.id).moveCard("bag") //Move card to bag
            activeDie.remove()
            new Die({value: activeDie.dataset.rollvalue - targetCard.dataset.cost, ignoreRounding: true}) //Return excess for gemdie
            playSFX('pay')
            }
        else if(activeDie.dataset.rollvalue === targetCard.dataset.cost){
            findByProperty(g.table, "itemId", targetCard.id).moveCard("bag") //Move card to bag
            activeDie.remove()
            playSFX('pay')
        }else{
            el("dice").appendChild(draggedElement)
            playSFX('cantPay', "single")
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

            this.pile      = []
            this.table     = []
            this.void      = []
            this.bag       = []
            this.selection = []

            this.turnCounter = 0
            this.targets  = []

            this.itemsPerTurn = confirm.itemsPerTurn
        }

        //Update html based on game state
        updateUI(){
            el(`voidBtn`).innerHTML = `
                <p>${g.void.length}</p>
            `

            el(`bagBtn`).innerHTML = `
                <p>${g.bag.length}</p>
            `

            el(`pileBtn`).innerHTML = `
                <p>${g.pile.length}</p>
            `
        }

        //Turn
        nextTurn(){
            if(g.inputLock) return

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
            

            //TRIGGER EFFECT : turnEnd
            g.table.forEach(item => {
                if(item.effectType !== "turnEnd") return
                item.fx()
            })
    

            //REVEAL 4 ITEMS
            this.reveal(this.itemsPerTurn)
            

            //ROLL DICE
            this.addMultipleDice(config.turnDice)


            //TRIGGER EFFECT : turnStart : item effect that activate at the start of the turn
            this.triggerTurnStartFx()

            this.turnCounter++
            this.updateUI()

            if(this.turnCounter === 1){
                runAnim(el('turnBtn'), 'fade')
                el('turnBtn').innerHTML = `<img src="./img/ui/turn.png" alt="">`
            }
        }

        //Moves item from pile to table, if no space voids it.
        reveal(quant){

            if(this.pile.length >= quant){
                
                for(let i = 0; i < quant; i++){
                    q.add(() => this.dropManager().moveCard("table"))
                }
            }
            //Moves remaining items
            else if(this.pile.length > 0 ){
                let remainingCards = this.pile.length

                for(let i = 0; i < remainingCards; i++){                    
                    q.add(() => this.dropManager().moveCard("table"))
                }
            } 

            //Pile hits 0 => Last turn
            if(this.pile.length === 0){
                
                el('turnBtn').setAttribute('onclick', 'g.gameOver()')
                
                el('turnBtn').innerHTML = `
                    <img src="./img/ui/end-game.png">
                `

                el('turnBtn').classList.add("endRunBtn")

                g.finalTurn = true
            }
        }

        dropManager(){
            let bricks = findByProperty(this.table, "brick", "y", 'includes').length
           

            if(bricks > 3 && findByProperty(this.pile, "brick", "n", 'includes').length > 0){
                let items = findByProperty(this.pile, "brick", "n", 'includes')
                return rarr(items)
            }
            else {
                return rarr(this.pile)
            }
        }

        triggerTurnStartFx(){
             q.add(() =>
                g.table.forEach(item => {
                    if(item.effectType.includes("turnStart")){  
                        item.fx()
                    }
                })
            )   
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
            // if(this.pile.length < 1){
                console.log("Game over");

                //Calc score
    
                let runOutcome 
                let total = g.cardsRef.length
                let gold = Math.floor(total * 0.90)
                let silver = Math.floor(total * 0.80)
                let bronze = Math.floor(total * 0.65)

                if(g.bag.length >= gold){
                    runOutcome = "Gold"
                }
                else if (g.bag.length >= silver){
                    runOutcome = "Silver"
                }
                else if (g.bag.length >= bronze){
                    runOutcome = "Bronze"
                }
                else{
                    runOutcome = "Failed"
                }

                el('runType').innerHTML = runOutcome

                el('targetGold').innerHTML = gold
                el('targetSilver').innerHTML = silver
                el('targetBronze').innerHTML = bronze

                el('scoreInBag').innerHTML = g.bag.length
                el('totalItems').innerHTML = total

                el('statBag').innerHTML = g.bag.length
                el('statVoid').innerHTML = g.void.length
                el('statTable').innerHTML = g.table.length
                el('statTurns').innerHTML = g.turnCounter

                // later

                document.removeEventListener('keydown', keyHandler);
                document.addEventListener('keydown', newKeyHandler);

                toggleModal("gameOver")

                return true
            // }            
        }

        
        //MODE manager
        async selectionMode(args){
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
                el('selectionShade').classList.remove('hide') //toggle shade
  
                
                g.table.forEach( async item =>{
                    //Add shake
                    await item.htmlElem.classList.add('selection', 'shake', 'clickable')
                    // item.htmlElem.addEventListener("click", returnTarget) //Add event listener that stores clicked element
                })
                
                
                g.mode = args.location
                g.activeItem = args.sourceItem //Store active item for reference in effect method
                
              
            }
            // Void bag
            else if(args.location === "void" || args.location === "bag"){
                
                g.mode = args.location
                g.activeItem = args.sourceItem //Store active item for reference in effect method
                el('selectionShade').classList.remove('hide') //toggle shade
                
                g[args.location].forEach(item =>{
                    // item.moveCard('selection') //will trigger on move
                    el('selectionContainer').appendChild(item.htmlElem)

                    //Add shake
                    item.htmlElem.classList.add('selection', 'shake', 'clickable')
                    // item.htmlElem.addEventListener("click", returnTarget) //Add event listener that stores clicked element
                })
            }


            // Exits mode
            else if(args.mode !== undefined && args.mode === "exit"){
                el('selectionShade').classList.add('hide') //toggle shade

                console.log(g.mode);
                

                if(g.mode === "dice"){
                    g.dice.forEach(die =>{die.clearSelectionMode()})
                }
                else if (g.mode === "table"){
                    g.table.forEach(item =>{item.clearSelectionMode()})
                }
                else if (g.mode === "void" || g.mode === "bag"){

                    //Reverse iterate & return all items to back
                    q.add(() => {
                        for (let i = g[g.mode].length - 1; i >= 0; i--) {                        
                            g[g.mode][i].clearSelectionMode()
                            g[g.mode][i].moveCard(g.mode, {bypass: true, animBypass: true}) 
                            // console.log(g[g.mode][i], ": returned to : ", g.mode);                       
                        }
                    })
                    
                }

                 q.add(() => {
                    g.mode = false
                    g.targets = []
                })
                                
            }
        }
    }


//START GAME
    let g //global game variable
    let cardsRef //required here due to fetch

    function startGame(){
        g = new Game
        
        //Generate all items
        g.initialGen = true
        //Setup config board
        if(config.gameState !== undefined){

            cardsRef.forEach(card =>{
                    g.cardsRef.push(card)
            })

            for (const [key, value] of Object.entries(config.gameState)) {  
               value.forEach(name => {
                   new Card({
                       "name": name,
                       "location":key,
                       "effect": "effect",
                       "cost": "cost",
                       "mode": "initial",
                   }) 
               })
            }

        }
        //Setup game board
        else {
            cardsRef.forEach(card =>{
    
                if(card.hide !== "y"){
                    g.cardsRef.push(card)
    
                    //Add card to pile
                    new Card({
                        "name": card.name,
                        "location":"pile",
                        "effect": "effect",
                        "cost": "cost",
                        "mode": "initial",
                    }) 
                }
            })
        }
        g.initialGen = false

        //Misc
        g.updateUI()
        // runAnim(el("imgGirl"),`idle`)
        // g.nextTurn()

        //Keyboard listener
        document.addEventListener('keydown', keyHandler);
    }
    
    //KEYBOARD
    function keyHandler(event) {
        if(g.inputLock) return

        if(event.code === 'Space' && g.finalTurn){            
            g.gameOver()
        }
        else if (event.code === 'Space') {
            g.nextTurn()        
        } 
        else if (event.code === 'KeyB') {
            toggleModal('bagModal')
        } 
        else if (event.code === 'KeyV') {
            toggleModal('voidModal')
        }
    }
    function newKeyHandler(event) {
        
        if (event.code === 'Space') {
            location.reload()
        } 
    }

    //Event queue
    const q = new ActionQueue()
    const pause = ms => new Promise(resolve => setTimeout(resolve, ms)) //allows to add pauses for animations

    //AUDIO UNLOCK
    const audio = new SoundManager()
    // sfx works without this, but bg doesn't
    function unlockAudio() {
        sound.playMusic(`bg-audio`);
        window.removeEventListener("pointerdown", unlockAudio);
    }
    window.addEventListener("pointerdown", unlockAudio, { once: true });


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