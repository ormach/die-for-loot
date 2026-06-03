//Drag and drop 
//Requires any ID for draggable elem
    let draggedCard
    let overlappingCard
    let targetContainer

    function allowDrop(ev) {
        ev.preventDefault();
    }
    //Drag card
    function drag(ev) {
        //Record dragged card
        draggedCard = ev.target //logs picked card

        //Records dragged card (records id)
        // ev.dataTransfer.setData("text/plain", ev.target.id);

        //Make all cards not interactable?
    }
    //Drop card
    function drop(ev) {
        ev.preventDefault();

        //Get data from drag() function (transefrs id)
        // var data = ev.dataTransfer.getData("text/plain");

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
        findByProperty(g.cards, 'cardId', draggedCard.id).location = targetContainer.id
        
        // console.log(
        //     findByProperty(g.cards, 'cardId', draggedCard.id)
        // );   
    }
    


//GAME & UI
    class Game {
        constructor(){
            //Storge per game section, place in LS and build board state from this obj.
            this.cards = [] //Stores all card objects
            this.cardsRef = []
        }


        //Regen html based on game state
        updateUI(){}

        //Creates card elements
        genCard(args){
            for(let i = 0; i < args.number; i++){
                new Card(args)           
            }
        }
    }


//CARD
    class Card {
        //constructor(cardRef, location, mode)
        constructor(args){
            // console.log(args);            
            let newCardName = args.name

            //Recreates existing card
            if(args.mode === 'regen'){            
                // this.cardRefObj = args.cardObj
                // console.log(this.cardRefObj);
                this.cardRefObj = findByProperty(cardsRef, 'name', args.cardObj.name)            


                this.cardId = args.cardObj.cardId
                this.location = args.cardObj.location  
            }

            //Creates new random card
            else{
                //Choose random card if no name provided
                if(args.name == undefined){
                    if(args.setName == undefined){
                        args.name = rarr(cardsRef).name
                    }
                    else {
                       let set = cardsRef.filter((card) => card.set === args.setName);
                    //    console.log(cardsRef, args.setName);
                        newCardName = rarr(set).name                       
                    }
                }

                //Find card reference in ref object
                this.cardRefObj = findByProperty(cardsRef, 'name', newCardName)            
                // console.log(this.cardRefObj);
                
                //Set props
                this.cardId = genId('cr')
                this.location = args.location //stores id of location elem

            }

            this.name = this.cardRefObj.name
            this.effect = this.cardRefObj.effect
            this.type = this.cardRefObj.type
            this.cost = this.cardRefObj.cost
                     
            g.cards.push(this)        
            
            //Generate html elem
            let card = this.genHtml()
            
            //Append html element to location  
            // console.log(el(location));
            if(el(args.location) !== null){
                this.moveCard(card, args.location)
            }    
            
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
                        <p>${this.cost}</p>
                    </div>
            `

            //On right click event
            card.addEventListener("contextmenu", (event) => {
                if(config.rClickEvent == true){
                    if(this.location === "hand" || this.location.includes('page')){
                        this.location = "contract-content_slot-0"
                    } else {
                        this.location = "hand"
                    }
                    event.preventDefault();
                    this.moveCard(card, this.location)
                    g.saveGame()
                }
            });

            return card
        }

        moveCard(cardHtmlElem, locationId){

            this.location = locationId
            // console.log(cardHtmlElem);

            //If you add to hand, add to the start of the row
            // console.log(locationId);
            if(locationId === 'hand'){
                el(locationId).insertBefore(cardHtmlElem, el(locationId).firstChild)
            }

            //Else add to slot
            else{                
                el(locationId).append(cardHtmlElem)
            }     

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
        })

        cardsRef = g.cardsRef     
        console.log(cardsRef);
           

        //Load/generate game
        g.updateUI()
    }

    function genCard(name){
       g.genCard({
            "number": 1,
            "location": "1",
            "name": name,
            "effect": "effect",
            "cost": "cost"
        }) 
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