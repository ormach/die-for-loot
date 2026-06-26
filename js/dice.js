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

        //Click listener
        die.addEventListener("click", () => {
            if(g.mode === "dice"){
                // console.log(`Die: Selected`, event.target);

                //Send selected die to item fx while in selection mode
                g.activeItem.fx(["target", event.target])
            }else {
                // console.log(`Die: Nothing`, event.target);
            }
        })        

        fixDrag(die) //Removes the base image during drag and leaves the projection
    }

    //Run spin animation
    spinAnim(){
        this.htmlElem.classList.remove("spin");
        void el.offsetWidth; // force reflow so browser "resets" animation
        this.htmlElem.classList.add("spin");
    }

    delete(){
        this.htmlElem.remove()
        removeFromArr(g.dice, this)
    }
    setRollValue(val, bypassOnRollFx){

        //Normalize rolls
        if (val < 1) val = 1
        if (val > 6) val = 6

        this.value = val


        //TRIGGER : onRoll : item effect when die roll value is set
        if(bypassOnRollFx === undefined){
            g.table.forEach(item => {
                if(item.effectType !== "onRoll") return
                item.fx(this)        
            })
        }

        //Update html
        this.updateHtml()
    }

    updateHtml(){
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
        // this.htmlElem.removeEventListener("click", returnTarget)
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