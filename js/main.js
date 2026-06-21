//Drag and drop 
//Requires any ID for draggable elem
    let draggedElement
    let overlappingCard
    let targetContainer

    function allowDrop(ev) {
        ev.preventDefault();
    }

    //MOVE card
    function drag(ev) {
        //Record dragged element
        draggedElement = ev.target //logs picked card

        //Records dragged element data to pass to drop(ev)
        ev.dataTransfer.setData("text/plain", ev.target.id);

        // console.log(ev.target.classList[0], ev.target.id, ev.target.dataset.rollvalue);
    }

    //DROP card
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
    
            //Move 4 items from pile to the table            
            if(this.pile.length > 3){
                for(let i = 0; i < 4; i++){
                    rarr(this.pile).moveCard("table")
                }
            }
            //Moves remaining cards
            else if(this.pile.length > 0 ){
                let remainingCards = this.pile.length

                for(let i = 0; i < remainingCards; i++){                    
                    rarr(this.pile).moveCard("table")
                }
            } 
            else{
                this.gameOver()
            }

            if(this.pile.length === 0){
                
                el('turnBtn').innerHTML = `
                    End game 
                    <span style="opacity: 0.5;">(space)</span>
                `

                el('turnBtn').classList.add("endRunBtn")
            }
            
            this.turnCounter++

            //Get 2 dice
            this.clearDice()
            new Die
            new Die

            console.log("Turn started");

            this.updateUI()
        }

        //Clear dice
        clearDice(){
            g.dice = []
            el("dice").innerHTML = ``
 
            // console.log("Dice cleared.");           
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
    }


//DIE
    class Die {
        constructor(){
            this.value = rng(6,1)
            this.dieId = genId('di')
            g.dice.push(this)
            
            this.genDieHtml()

            // console.log(g.dice);
        }

        //Adds die html element to #dice
        genDieHtml(){
            let die = document.createElement('div')
            
            die.id = this.dieId
            die.classList = 'die'
            die.setAttribute('draggable','true')
            die.setAttribute('ondragstart','drag(event)')

            die.setAttribute('data-rollvalue', this.value)
            
            // Image & position
            die.setAttribute('style',`
                background-image: url("./img/die/id=${this.value}.svg");
                top: ${el("dice").childNodes.length * 100}px
            `) 
            
            el('dice').append(die)
            this.htmlElem = die

            this.spinAnim()

            // console.log(die);          
        }

        spinAnim(){
            
            this.htmlElem.classList.remove("spin");

            // force reflow so browser "resets" animation
            void el.offsetWidth;

            this.htmlElem.classList.add("spin");
            
        }
    }


//CARD
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
            this.effect = this.cardRefObj.effect
            this.type   = this.cardRefObj.type
            this.cost   = this.cardRefObj.cost
                    
            //Check if no cards
            // if (g.gameOver()) return   
            // g.cards.push(this)    
            
            //Generate html elem
            this.genHtml()
            
            //Append html element to location  
            this.moveCard(args.location)  
        }

        //Returns card html element
        //Used for LS regen
        genHtml(){
            let card = document.createElement('div')
            let cardImg = this.name
            
            card.id = this.cardId
            card.classList = 'card'
            card.setAttribute('draggable','true')
            card.setAttribute('ondragstart','drag(event)')
            card.setAttribute('data-cost', this.cost)
            
            // console.log(this.cardRefObj);          
            
            if(this.cardRefObj.img === "y"){   
                card.setAttribute('style',`background-image: url("./img/card/id=${cardImg}.png")`) 
            }


            card.innerHTML = `
                    <img class="itemImg" src="./img/items/id=${this.name}.png">

                    <div class="props">
                        <p>${upp(this.type)}</p>
                        <img class="cost" src="./img/die/id=${this.cost}.png"></img>
                    </div>

                    <div class="card-data">
                        <p>${this.effect}</p>
                    </div>

            `

            //On right click event
            // card.addEventListener("contextmenu", (event) => {
            //     if(config.rClickEvent == true){
            //         if(this.location === "hand" || this.location.includes('page')){
            //             this.location = "contract-content_slot-0"
            //         } else {
            //             this.location = "hand"
            //         }
            //         event.preventDefault();
            //         this.moveCard(card, this.location)
            //         g.saveGame()
            //     }
            // });

            //Store html elem in obj
            this.htmlElem = card
            return card
        }

        moveCard(locationId){

            let refCard = this //Store card obj to delete the initial one
            let tableSlot
            
            removeFromArr(g[this.location], this) //Remove initial card obj

            refCard.location = locationId


            //Find empty table slot or void              
            if(locationId == "table"){

                //If 6+ slot with card, then void
                for(let i = 1; i < 6; i++){

                    if(el(`${i}`).childNodes.length == 0){
                        tableSlot = `${i}`
                    }                    
                }

                //Loop from slot 1.
                let i = 1;
                let placed = false

                while (placed == false) {

                    if(i == 7){
                        locationId = "void"
                        refCard.location = "void"
                        // console.log("Card voided."); 
                        placed = true
                        i = 6
                    }

                    if(el(`${i}`).childNodes.length == 0){
                        locationId = `${i}`
                        
                        placed = true
                    }

                    i++;

                }
            }

            //Move card object to appropriate game array
            g[refCard.location].push(refCard)

            //Move html to table slot or containers
            if(locationId === "table"){
                el(tableSlot).append(refCard.htmlElem)
            } 
            else{
                el(locationId).append(refCard.htmlElem)
            }

            g.updateUI()
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

        // cardsRef = g.cardsRef     
        // console.log(cardsRef);
           

        //Load/generate game
        g.updateUI()
        g.nextTurn()


        //Keyboard shortcuts (event = keyup or keydown)
        // document.addEventListener('keydown', event => {
        //     if (event.code === 'Space') {
        //         g.nextTurn()
        //     }
        //     else if (event.code === 'KeyB') {
        //         toggleModal(`bag`)
        //     }
        //     else if (event.code === 'KeyV') {
        //         toggleModal(`void`)
        //     }
        // })

        document.addEventListener('keydown', keyHandler);
    }
    
    function keyHandler(event) {
        if (event.code === 'Space') {
            g.nextTurn();
        } 
        else if (event.code === 'KeyB') {
            toggleModal('bag');
        } 
        else if (event.code === 'KeyV') {
            toggleModal('void');
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