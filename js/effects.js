let itemEffectRef = {
    //On move (self)
    pig(){
        if(!this.checkConditions({reqLocation: "bag"})) return
        new Die
    },
    bucket(){
        if(!this.checkConditions({})) return
        new Die({value:2})

        new Alert(`Bucket moved, a 2-value die was added.`, this.name)

    },
    crown(){
        if(!this.checkConditions({reqLocation: "void"})) return

        let item =  rarr(g.table)
        item.moveCard('bag')

        new Alert(`Crown was moved to void, and moved ${item.name} to bag.`, this.name)
    },
    rune(){
        if(!this.checkConditions({})) return

        g.table.forEach(item => {
            if(item.cost < 2) return
            item.cost --
            item.updateHtml()
        })

        new Alert(`Rune moved, all costs reduced by 1.`, this.name)

    },

    //onOtherMove
    jar(item){
        console.log(item.location);
        
        if(!this.checkConditions({
            reqLocation: "table", 
            target: item,
            targetLocation:"void", 
        })) return
        new Die({value:1})

        new Alert(`An item was moved to void, a 1-value die was added.`, this.name)

    },
    binder(item){
        if(!this.checkConditions({
            reqLocation: "table", 
            target: item,
            targetType: "relic",
            targetLocation: "bag",
        })) return

        new Die()

        new Alert(`Relic moved to bag, a die was added.`, this.name)
    },
    cat(item){
        if(!this.checkConditions({
            reqLocation: "table", 
            target: item,
            targetType: "relic",
            targetLocation: "table",
        })) return
        
        item.moveCard("void")
    },

    //onRoll (arg is a die object)
    frog(arg){
        if(!this.checkConditions({reqLocation: "table"}) || arg === undefined) return
        
        
        let val = arg.value * 1 + 1

        // console.log(g);
        // console.log(g.pliersTarget.name);
        // console.log(g.pliersTarget !== undefined && g.pliersTarget.name === "crown");
        
        if(g.pliersTarget !== undefined && g.pliersTarget.name === "crown"){
            arg.setRollValue(val, true, "ignoreRounding")  
            g.pliersTarget = undefined //fixes pliers + crown + frog combo for one frog
        }
        else{
            arg.setRollValue(val, true)  
        }
    
    },
    tax(arg){
        if(!this.checkConditions({reqLocation: "table"}) || arg === undefined) return

        let val = arg.value - 1

        arg.setRollValue(val, true)            
    },
    zombie(arg){
        if(!this.checkConditions({reqLocation: "table"}) || arg === undefined) return

        if(arg.value === 2){
            g.reveal(2)
        }
    },
    rope(arg){
        if(!this.checkConditions({reqLocation: "table"}) || arg === undefined) return
        
        if(arg.value === 6){
            let removed = false

            g.table.forEach(item => {
                if(item.type === "tool" && removed === false){
                    item.moveCard("void")
                    removed = true
                }
            })
        }
    },

    //turnStart
    async delay(){
        if(!this.checkConditions({reqLocation: "table"})) return

        g.table.forEach(item => {
            if(item.flags.uses > 0){      
                if(item.type !== "tool") return 

                item.flags.uses = item.cost

                item.updateHtml()
            }
        })
        
    },
    

    //turnEnd
    limit(){
        if(!this.checkConditions({reqLocation: "table"})) return
        g.itemsPerTurn = 3
    },
    bingo(){
        if(!this.checkConditions({reqLocation: "table"})) return

        let tableCosts = []

        g.table.forEach(item => {
            tableCosts.push(item.cost)
        })
        

        let targetCost = checkDuplicates(tableCosts, 3)
        
        
        if(targetCost.length < 1) return
        
        //For multiple movements, iterate backwards due to index shifts.
        let limitCounter = 3
        for(let i = g.table.length -1; i >= 0; i--){
            // console.log(
            //     g.table[i].cost * 1 === targetCost[0] * 1,
            //     g.table[i].cost, targetCost[0] * 1
            // );

            if(g.table[i].cost * 1 === targetCost[0] * 1 && limitCounter > 0){
                console.log('bingo');
                
                limitCounter--
                g.table[i].moveCard("bag")

                
            }
        }

        new Alert(`BINGO!!! 3 items were moved to bag.`, this.name)

    },

    //onClick
    //arg = ["target", event.target]
    lantern(arg){
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
            
            g.selectionMode({mode: 'exit'})
            this.endEffect({uses: true})
        }

        //Initiates selection mode
        if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
        g.selectionMode({location: "dice", sourceItem: this})
    },
    calculator(arg){

        //Handles returned die
        if(arg !== undefined && arg[0] === "target"){

            //Finds object by html id
            let target = findByProperty(g.dice, "dieId", arg[1].id)

            target.multiply(2)
            
            g.selectionMode({mode: 'exit'})
            this.endEffect({uses: true})
        }

        //Initiates selection mode
        if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
        g.selectionMode({location: "dice", sourceItem: this})
    },
    //old duplication effect
    printer(arg){

        //Handles returned die
        if(arg !== undefined && arg[0] === "target"){

            //Finds object by html id
            let target = findByProperty(g.dice, "dieId", arg[1].id)

            target.duplicate()
            
            g.selectionMode({mode: 'exit'})
            this.endEffect({uses: true})
        }

        //Initiates selection mode
        if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
        g.selectionMode({location: "dice", sourceItem: this})
    },
    tower(arg){

        //Handles returned die
        if(arg !== undefined && arg[0] === "target"){

            //Finds object by html id
            let target = findByProperty(g.dice, "dieId", arg[1].id)

            target.reroll()
            
            g.selectionMode({mode: 'exit'})
            this.endEffect({uses: true})
        }

        //Initiates selection mode
        if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
        g.selectionMode({location: "dice", sourceItem: this})
    },
    chisel(arg){

        //Handles returned die
        if(arg !== undefined && arg[0] === "target"){

            //Finds object by html id
            let target = findByProperty(g.dice, "dieId", arg[1].id)
            
            let newValue = target.value - 1

            target.setRollValue(newValue)
            
            g.selectionMode({mode: 'exit'})
            this.endEffect({uses: true})
        }

        //Initiates selection mode
        if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
        g.selectionMode({location: "dice", sourceItem: this})
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
            
            g.selectionMode({mode: 'exit'})
            this.endEffect({uses: true})
        }

        //Initiates selection mode
        if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
        g.selectionMode({location: "dice", sourceItem: this})
    },
    camera(arg){
        
        //Select 1st die.
        if(arg !== undefined && arg[0] === "target"){

            //Finds object by html id
            let target = findByProperty(g.dice, "dieId", arg[1].id)

            let value = target.value

            g.dice.forEach(die => {
                die.setRollValue(value)
            })

            g.selectionMode({mode: 'exit'})
            this.endEffect({uses: true})
        }

        //Select 2nd die.
        if(g.targets.length === 2){

            g.targets[1].setRollValue(g.targets[0].value)
            
            g.selectionMode({mode: 'exit'})
            this.endEffect({uses: true})
        }

        //Initiates selection mode
        if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
        g.selectionMode({location: "dice", sourceItem: this})
    },
    hammer(arg){

        //Handles returned die
        if(arg !== undefined && arg[0] === "target"){

            //Finds object by html id
            let target = findByProperty(g.dice, "dieId", arg[1].id)

            let quantity = target.value
            target.delete()

            g.addMultipleDice(target.value, {value:1})
            
            g.selectionMode({mode: 'exit'})
            this.endEffect({uses: true})
        }

        //Initiates selection mode
        if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
        g.selectionMode({location: "dice", sourceItem: this})
    },

    catapult(arg){
        if(arg !== undefined && arg[0] === "target" && g.mode !== false){

            //Finds object by html id
            let target = findByProperty(g.table, "itemId", arg[1].id)
            
            //Effect
            target.clearSelectionMode()
            q.add(() =>target.moveCard("pile"))

            g.selectionMode({mode: 'exit'})
            this.endEffect({uses: true})
        }

        //Initiates selection mode
        //"arg = "used" for multiple uses.
        if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
        g.selectionMode({location: "table", sourceItem: this})
    },
    acid(arg){
        
        //Effect after selection mode
        if(arg !== undefined && arg[0] === "target" && g.mode !== false){

            //Finds object by html id
            let target = findByProperty(g.table, "itemId", arg[1].id)
            
            //Effect
            target.clearSelectionMode()
            target.moveCard("void")
            new Die

            g.selectionMode({mode: 'exit'})
            this.endEffect({uses: true})
        }

        //Initiates selection mode
        //"arg = "used" for multiple uses.
        if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
        g.selectionMode({location: "table", sourceItem: this})
    },
    counterspell(arg){
        //Initiates selection mode
        //"arg = "used" for multiple uses.
        if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
        
        //Effect
        this.moveCard('void')

        //For multiple movements, iterate backwards due to index shifts.
        for(let i = g.table.length -1; i >= 0; i--){
            g.table[i].moveCard("pile")
        }
    },
    mirror(arg){
        if(arg !== undefined && arg[0] === "target" && g.mode !== false){

            //Finds object by html id
            let target = findByProperty(g.table, "itemId", arg[1].id)
            
            //Effect
            this.transform({target: target, mode: "all"})

            g.selectionMode({mode: 'exit'})
            this.endEffect({uses: true})
        }

        //Initiates selection mode
        //"arg = "used" for multiple uses.
        if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
        g.selectionMode({location: "table", sourceItem: this})
    },
    slots(arg){
        //Initiates selection mode
        //"arg = "used" for multiple uses.
        if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return  

        //For multiple movements, iterate backwards due to index shifts.
        for(let i = g.table.length -1; i >= 0; i--){
            g.table[i].transform({mode: "cost"})
        }

        this.endEffect({uses: true})
    },
    //Added "void" mode to items event listener for selection to work on void.
    necronomicon(arg){
        
        if(arg !== undefined && arg[0] === "target" && g.mode !== false){

            //Finds object by html id
            let target = findByProperty(g.void, "itemId", arg[1].id)
            
            //Effect
            target.clearSelectionMode()
            q.add(() => target.moveCard('table'))

            g.selectionMode({mode: 'exit'})
            this.endEffect({uses: true})
        }

        //Initiates selection mode
        //"arg = "used" for multiple uses.
        if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
        g.selectionMode({location: "void", sourceItem: this})
    },
    idol(arg){
        
        if(arg !== undefined && arg[0] === "target" && g.mode !== false){

            //Finds object by html id
            let target = findByProperty(g.bag, "itemId", arg[1].id)
            
            //Effect
            target.clearSelectionMode()
            q.add(() => this.moveCard('bag')) //move to bag 1st to free up space
            q.add(() => target.moveCard('table'))

            g.selectionMode({mode: 'exit'})
            this.endEffect({uses: true})
        }

        //Initiates selection mode
        //"arg = "used" for multiple uses.
        if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
        g.selectionMode({location: "bag", sourceItem: this})
    },
    pliers(arg){
        if(arg !== undefined && arg[0] === "target" && g.mode !== false){

            //Finds object by html id
            let target = findByProperty(g.table, "itemId", arg[1].id)
            g.pliersTarget = target
            console.log(g.pliersTarget.name);
            

            //Effect
            new Die({value:target.cost, ignoreRounding: true})
            target.clearSelectionMode()
            target.transform({mode:"cost", value: 1})

            g.selectionMode({mode: 'exit'})
            this.endEffect({uses: true})
        }

        //Initiates selection mode
        //"arg = "used" for multiple uses.
        if(arg !== "used" || !this.checkConditions({reqLocation: "table", uses: true})) return
        g.selectionMode({location: "table", sourceItem: this})
    },
    
}