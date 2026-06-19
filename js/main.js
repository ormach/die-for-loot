//Drag and drop 
//Requires any ID for draggable elem
    let draggedCard
    let overlappingCard
    let targetContainer

    function allowDrop(ev) {
        ev.preventDefault();
    }

    //MOVE card
    function drag(ev) {
        //Record dragged card
        draggedCard = ev.target //logs picked card
        // console.log(ev.target.classList[0], ev.target.id, ev.target.dataset.rollvalue);
        

        //Records dragged element data to pass to drop(ev)
        ev.dataTransfer.setData("text/plain", ev.target.id);
    }

    //DROP card
    function drop(ev) {
        ev.preventDefault();
        

        //Record target elem
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
        targetContainer.appendChild(draggedCard);

        //Do stuff on card placement
        //Update card location

        //Target element id
        let targetCard = ev.target.closest(".card")        
        // findByProperty(g.cards, 'cardId', draggedCard.id).location = targetContainer.id
        

        //EVALUATE costs

        //Get data from drag() function (transfers id)
        var data = ev.dataTransfer.getData("text/plain");
        let activeDie = el(data)

        console.log(`
            Roll value: ${activeDie.dataset.rollvalue} 
            / 
            Target element:( ${targetCard.id} | ${ev.target.dataset.cost} )
        `);
        

        if(activeDie.dataset.rollvalue == targetCard.dataset.cost){
            console.log('Cost paid');
            targetCard.remove()
            activeDie.remove()
        }

        // console.log(
        //     findByProperty(g.cards, 'cardId', draggedCard.id)
        // );   
    }
    


//GAME & UI
    class Game {
        constructor(){
            this.cards = [] //Stores all card objects
            this.cardsRef = []
            this.dice = []
            this.void = []
            this.bag = []
            this.pile = []
        }


        //Regen html based on game state
        updateUI(){
            el(`voidBtn`).innerHTML = `
                Void (${this.void.length})
            `

            el(`bagBtn`).innerHTML = `
                Bag (${this.bag.length}/30)
            `

            el(`pile`).innerHTML = `
                Pile (${this.pile.length})
            `
        }

        //Creates card elements
        genCard(args){
            let cardQuantity

            if(args == undefined){
                cardQuantity = 1
            } else{
                cardQuantity = args.number
            }

            for(let i = 0; i < cardQuantity; i++){
                new Card(args)           
            }
        }

        //Turn
        startTurn(){
            //Place 4 items on the table
            this.genCard({"number": 4})

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
            
            // Image
            die.setAttribute('style',`background-image: url("./img/die/id=${this.value}.png")`) 
            
            el('dice').append(die)

            // console.log(die);          
        }
    }


//CARD
    class Card {
        //constructor(cardRef, location, mode)
        constructor(args){
            // console.log(args);   
            
            if(args.name == undefined){
                args = {
                    "name": rarr(cardsRef).name,
                    "effect": "effect",
                    "cost": "cost",
                    "location": "table",
                } 
            }

            let newCardName = args.name

            //Find card reference in ref object
            this.cardRefObj = findByProperty(cardsRef, 'name', newCardName)            
            // console.log(this.cardRefObj);
            

            //Set props
            this.cardId = genId('cr')
            this.location = args.location //stores id of location elem

            
            this.name   = this.cardRefObj.name
            this.effect = this.cardRefObj.effect
            this.type   = this.cardRefObj.type
            this.cost   = this.cardRefObj.cost
                     

            g.cards.push(this)        
            

            //Generate html elem
            let card = this.genHtml()
            

            //Append html element to location  
            // console.log(el(location));
            this.moveCard(card, args.location)  
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
            else {            
                card.setAttribute('style',`background-image: url("./img/card/id=template.png")`) 
            }

            card.innerHTML = `
                    <div class="card-data">
                        <h2>${upp(this.name)}</h2>
                        <p>${this.effect}</p>
                        <p>Cost: ${this.cost}</p>
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

            return card
        }

        moveCard(cardHtmlElem, locationId){

            this.location = locationId

            //Find empty table slot or void              
            if(locationId == "table"){

                //If 6+ slot with card, then void
                for(let i = 1; i < 6; i++){

                    if(el(`${i}`).childNodes.length == 0){
                        locationId = `${i}`
                    }

                    // console.log(locationId);
                    
                }

                //Loop from slot 1.
                let i = 1;
                let placed = false

                while (placed == false) {

                    if(i == 7){
                        locationId = "void"
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

            
            el(locationId).append(cardHtmlElem)

            // console.log(cardHtmlElem);
        }
    }


//START GAME
    let g //global game variable
    let cardsRef //required due to fetch

    function startGame(){
        g = new Game
        
        //Add cards to game obj
        cardsRef.forEach(card =>{
                g.cardsRef.push(card)
                g.pile.push(card)
        })

        cardsRef = g.cardsRef     
        console.log(cardsRef);
           

        //Load/generate game
        g.updateUI()
        g.startTurn()
    }
    


//Fetch csv file, parse to JSON, assing it to reg obj
    fetch('./Library game cards [2024] - Sheet1.csv')
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