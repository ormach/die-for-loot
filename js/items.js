class Card {
    constructor(args){
        
        // console.log(args);
        let newCardName = args.name

        //Find card reference in ref object
        this.cardRefObj = findByProperty(g.cardsRef, 'name', newCardName)                                    

        //Set props
        this.itemId = genId('cr')
        this.location = args.location //stores id of location elem
        this.name   = this.cardRefObj.name
        this.effect = this.cardRefObj.effect //rename to effectDescription
        this.effectType = this.cardRefObj.effectType
        this.type   = this.cardRefObj.type
        this.cost   = this.cardRefObj.cost 
        this.brick  = this.cardRefObj.brick

        this.setFlags()

        //Adds card function to the card
        this.fx = itemEffectRef[this.name]
        //Sets blank if no function is defined
        if(itemEffectRef[this.name] === undefined){this.fx = function empty() {}}
        
        //Generate html elem
        this.genHtml()
        
        //Append html element to location  
        this.moveCard(args.location, {mode:"generation"})
        
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
        
        card.id = this.itemId
        card.classList = 'card'

        //Allows drag
        // card.setAttribute('draggable','true')
        // card.setAttribute('ondragstart','drag(event)')

        //Allows drop
        card.setAttribute('ondrop','drop(event)')
        card.setAttribute('ondragover','allowDrop(event)')

        //Stores dice cost in html
        card.setAttribute('data-cost', this.cost)      
        
        //IMG management
        let img = this.name
        let imgString = `<img class="itemImg" src="./img/items/id=${img}.png">`
        

        //Adds on click event for html elem
        card.addEventListener("click", () => { //click => onclick event, not listener id
            //Send selected item to item fx while in selection mode
            if(g.mode === 'table' || g.mode === 'void' || g.mode === 'bag'){
                g.activeItem.fx(["target", event.target])
            }
            //Trigger item effect
            else if (this.effectType === "onClick") {
                this.fx("used")  
            }
        })

        if(this.effectType === "onClick"){
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


        //Uses
        let uses = ""
            if(this.flags.uses !== undefined && this.flags.uses > 1){
                uses = `
                    <img src="./img/ui/dot-separator.svg">
                    <p>
                        ${this.flags.uses} uses
                    </p>
                `
            }
            else if (this.flags.uses !== undefined) {
                uses = `
                    <img src="./img/ui/dot-separator.svg">
                    <p>
                        ${this.flags.uses} use
                    </p>
                `
            }

        card.innerHTML = `
                ${imgString}

                <div class="props">
                    <p>${upp(this.type)}</p>
                    ${uses}
                </div>

                <img class="cost" src="./img/die/id=${this.cost}.png"></img>

                ${description}
        `

        //Store html elem in obj
        this.htmlElem = card
        return card
    }
        updateHtml(){
            //Rework it to only update cost uses etc.

            this.htmlElem.setAttribute('data-cost', this.cost)   

            //IMG management
            let img = this.name
            let imgString = `<img class="itemImg" src="./img/items/id=${img}.png">`


                //Adds on click event for html elem, click => onclick event not listener id
            if(this.effectType === "onClick" && this.flags.uses > 0){
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

            //Uses
            let uses = ""
            if(this.flags.uses !== undefined && this.flags.uses > 1){
                uses = `
                    <img src="./img/ui/dot-separator.svg">
                    <p>
                        ${this.flags.uses} uses
                    </p>
                `
            }
            else if (this.flags.uses !== undefined) {
                uses = `
                    <img src="./img/ui/dot-separator.svg">
                    <p>
                        ${this.flags.uses} use
                    </p>
                `
            }
            

            this.htmlElem.innerHTML = `
                    ${imgString}

                    <div class="props">
                        <p>${upp(this.type)}</p>
                        ${uses}
                    </div>

                    <img class="cost" src="./img/die/id=${this.cost}.png"></img>

                    ${description}
            `
        }

        async moveCard(locationId, args){
            //args — for onMove effects            
            this. previousLocation = this.location
            let refCard = this //Store card obj to delete the initial one
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
            

            //Animation & delay
            if(!g.initialGen || args?.animBypass){await this.animation()}
            
            
            //Move HTML
            el(locationId).append(refCard.htmlElem)
            // console.log(this.name, ": moved to :", locationId);
            
            
            //Reset flags on move (uses)
            refCard.setFlags() 
            refCard.updateHtml()


            //Clear interactive elements
            if(this.location === "void" || this.location === "bag"){
                this.htmlElem.classList.remove('clickable')
                this.htmlElem.childNodes[1].classList.remove("shake")
            }
        

            //TRIGGER EFFECT : onMove : Check for movement fx
            if(this.effectType.includes("onMove")){
                if(args !== undefined) return //why
                if(args !== undefined && args.bypass === true) return //for pig and bucket and exit mode
                this.fx()
            }
            //TRIGGER EFFECT : onOtherMove : If item moves to void, check table for effects.
            if(this.location === "void" || this.location === "bag" || this.location === "table"){
                g.table.forEach(item => {

                    if(args !== undefined && args.bypass === true) return //prevents binder trigger from idle preview

                    if(item.effectType === "onOtherMove"){

                        item.fx(this)
                    }

                    //Needed for lantern to reduce uses
                    else if(item.name === "lantern" && this.location === "void"){
                        
                        item.flags.uses--
                        if(item.flags.uses < 0){item.flags.uses = 0} 

                        item.updateHtml()
                    }
                })
            }

            g.updateUI() // updates counter
        }
            async animation(){

                //Move animation 
                let mover = el("mover")
                mover.classList.remove('hide')
                mover.setAttribute("src",`./img/items/id=${this.name}.png`)
                
                mover.classList = "" //Clear class list before animation switch
                runAnim(mover,`move-${this.previousLocation}-${this.location}`)
                // console.log(`${this.name} : Anim run: move-${this.previousLocation}-${this.location}`);
                

                // el('imgGirl').classList =""
                // runAnim(el("imgGirl"),`throw`)

                
                //DELAY
                await pause(config.aDelay); 
                
                //Hide move elem
                mover.classList.add('hide')
                
                //AUDIO
                sound.play(`drop-${rngNoRepeat(4)}`);
            }
        transform(args){
            if(args.mode === "all"){
                //Change object props
                this.cost = args.target.cost
                this.name = args.target.name
                this.effect = args.target.effect //rename to effectDescription

                this.type   = args.target.type
                this.effectType = args.target.effectType
                console.log(args.target.flags);
                
                this.flags  = {...args.target.flags}
                this.flags.uses++ //Required because later uses will be reduced for the copy
                this.fx = args.target.fx
            }
            else if(args.mode === "cost"){
                if(args.value === undefined){
                    this.cost = rng(6,1)
                }
                else {
                    this.cost = args.value
                }
            }

            this.updateHtml()
        }


    //Effects
        checkConditions(args){
            // console.log(args.targetType[1].name);
            
            let pass = true
            
            //Check location 
            if(args.reqLocation !== undefined && this.location !== args.reqLocation) pass = false

            //Check use charges
            if(args.uses !== undefined && this.flags.uses === 0) pass = false

            //Check target type (other item)
            if(args.targetType !== undefined && args.targetType !== args.target.type) pass = false

            //Check target location (other item)
            if(args.targetLocation !== undefined && args.targetLocation !== args.target.location) pass = false

            
            //Check if it was clicked TBA

            console.log(`${this.name} — activation conditions passed: ${pass}`)
            return pass
        }
        endEffect(args){
            //Remove css wiggle
            if(args.uses) this.flags.uses--

            //Resets target storage 
            g.targets = []

            this.updateHtml()

            playSFX('item-fx', "single")
        }
        clearSelectionMode(){            
            //Animations
            this.htmlElem.classList.remove('shake')
            this.htmlElem.classList.remove('selection')

            console.log(this.name, 'Cleared selection mode');
            
        }
}

