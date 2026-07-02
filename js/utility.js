function runAnim(elem, animClass){//Allows to run css animation mutliple times
    elem.classList.remove(animClass)
    void elem.offsetWidth; // enable reflow
    elem.classList.add(animClass)
}

function clearClassOfAll(classId){//Removes class from all html elems
    var elems = document.querySelectorAll(`.${classId}`);

    [].forEach.call(elems, function(el) {
        el.classList.remove(classId);
    });
}

function toggleModal(id){//modal
    document.getElementById(id).classList.toggle('hide')
    // this.runAnim(el(id).firstElementChild, 'modal-slide')

    playSFX('btn')
}

function rng(maxValue, minValue){//Random number
    if(minValue === undefined){minValue = 1}
    return Math.floor(Math.random() * (maxValue - minValue + 1) + minValue)
}

function rarr(arr){//Random arr item
    return arr[Math.floor(Math.random() * arr.length)]
}

// RNG that does not return the same value twice
let prev = null;
function rngNoRepeat(max, min) {
    if(min === undefined) {
        min = 1
    }
    
    if (max - min <= 0) return min;

    let value;
    do {
        value = Math.floor(Math.random() * (max - min + 1)) + min;
    } while (value === prev);

    prev = value;
    return value;
    
}

// INVERSE ARRAY: Use this when you remove items form array
// for (let i = array.length - 1; i >= 0; i--) {}

function shuffle(array) {//Suffle arr
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {

        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }

    return array;
}

function removeFromArr(data, elem){ //Removes elem from array
        let index = data.indexOf(elem);
            if (index > -1) { // only splice array when item is found
                data.splice(index, 1); // 2nd parameter means remove one item only
        }
}

function el(id, mod){//Returns html elem by id
    if(mod === 'all' && id.startsWith('.')){
        return document.querySelectorAll(id)
    }
    else if(id.startsWith('.')){
        return document.querySelector(id)
    }
    else{
        return document.getElementById(id)
    }
}

function cloneArr(arr){//Make a detached copy of an array
    return JSON.parse(JSON.stringify(arr));
}

function clearArr(arr){
    arr.splice(0, arr.length);
}

function removeDuplicatesArr(arr){
    return [...new Set(arr)];
}

function checkDuplicates(arr, quantOfDuplicates){
    //Take array of digits [1,2,3,3]
    //Looks for diplicates and returns value that has a particular number of duplicates.
    //quantOfDuplicated control how many duplicate values should there be for the value to be returned

    const counts = {};

    for (const value of arr) {
        counts[value] = (counts[value] || 0) + 1;
    }

    const duplicates = Object.keys(counts).filter(key => counts[key] >= quantOfDuplicates);

    return duplicates; // ["1", "2"]
}

function findObj(data, prop, val){ //Returns one obj with matching property value from data
    return data.find(x => x[prop] === val) 
}

function objContainsByPropValue(object, property, value){// See if obj contains obj with a particular value of a property. Frue/False
    return Object.values(object).some(obj => obj[property] === value)
}

function upp(string){//Sets 1st letter to uppercase
    return string.charAt(0).toUpperCase() + string.slice(1)
}

function clearLs(){
    localStorage.clear();
    location.reload();
}

//Used to find items by id in array
function findByProperty(dataArr, propertyName, propertyValue, mode){
    let foundItem

    //Returns array of items
    if(mode === 'includes'){
        foundItem = dataArr.filter(        
            (item) => item[propertyName].includes(propertyValue)
        )
    }
    
    //Returns one item
    else{
        dataArr.forEach(item => {
            if(item[propertyName] === propertyValue){
                // log(item)
                foundItem = item
            }
        })
    }

    return foundItem
}

//var csv is the CSV file with headers
// function csvJSON(csv){

//     var lines=csv.split("\n");
  
//     var result = [];
  
//     // NOTE: If your columns contain commas in their values, you'll need
//     // to deal with those before doing the next step 
//     // (you might convert them to &&& or something, then covert them back later)
//     var headers=lines[0].split(",");
  
//     for(var i=1;i<lines.length;i++){
  
//         var obj = {};
//         var currentline=lines[i].split(",");
  
//         for(var j=0;j<headers.length;j++){
//             obj[headers[j]] = currentline[j];
//         }
  
//         result.push(obj);
  
//     }
  
//     //return result; //JavaScript object
//     return JSON.stringify(result); //JSON
// }

function countDuplicatesInArr(arr, type){
    const counts = {};

    arr.forEach((x) => {
        counts[x] = (counts[x] || 0) + 1;
    });

    if(type == 'maxValue'){
        let arr = Object.values(counts);
        let max = Math.max(...arr);
        return max
    }
    else if(type == 'minValue'){ 
        let arr = Object.values(counts);
        return Math.min(...arr);
    }
    else{
        return counts //Returns object {a: 1, b: 2}
    }

}

//12 char unique id
function genId(prefix){
    let id = prefix + Math.random().toString(12).slice(2)
    return id
}

//var csv is the CSV file with headers
function csvJSON(csv){

    // var lines=csv.split("\n");
    var lines = csv.trim().split(/\r?\n/);

    var result = [];

    // console.table(lines);
    
    // NOTE: If your columns contain commas in their values, you'll need
    // to deal with those before doing the next step 
    // (you might convert them to &&& or something, then covert them back later)
    var headers=lines[0].split(",");

    //i represents how many top rows to skip
    for(var i=1; i<lines.length; i++){

        var obj = {};
        var currentline=lines[i].split(",");

        for(var j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
        }

        result.push(obj);
    } 
    
    //Replaces chars because fucking google sheet cant export with custom dilimiter
    let resultFix = findReplace(result, "|", ",")
    // console.table(resultFix);

    //return result; //JavaScript object
    return JSON.stringify(resultFix); //JSON
}

// Find all key-value pairs and replace a character in each value
function findReplace(obj, oldVal, newVal){

    result = JSON.parse(
        JSON.stringify(obj).replaceAll(oldVal, newVal)
    );

    return result
}

//Alert/Notification
let alertTimer
class Alert{
    constructor(note, image){

        let alert = document.createElement('div')
        alert.classList.add('alert')
        alert.onclick = () => alert.remove();

        let img = ""

        if(image !== undefined){
            img = `<img src="./img/items/id=${image}.png" alt="">`
        }
        alert.innerHTML = `
                ${img}  
                <p id="alert-note">${note}</p>
        `

        el('alert-container').append(alert)

        this.htmlElem = alert

        this.delete()
        
    }
    delete(){
        this.timer = setTimeout(() => {
            this.htmlElem.remove();
        }, 7000);
    }
}


// Prevents the mobile browser behaviour that moves to the next or previous page
// in your browser's history when you swipe in from the edge of the screen.
 
// Only seems to work reliably on Safari. Testing on Chrome iOS showed 
// inconsistent effectiveness. Did not test other browsers.
 
// returns A function to call to resume the browser's normal behaviour.
// Source: https://medium.com/@joelmalone/prevent-edge-swipe-gestures-in-your-html-game-but-only-in-safari-fba815a529a2

function preventBrowserHistorySwipeGestures() {
    function touchStart(ev) {
      if (ev.touches.length === 1) {
        const touch = ev.touches[0];
        if (
          touch.clientX < window.innerWidth * 0.05 ||
          touch.clientX > window.innerWidth * 0.95
        ) {
          ev.preventDefault();
        }
      }
    }
  
    // Safari defaults to passive: true for the touchstart event, so we need  to explicitly specify false
    // See https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
    const options= { passive: false };
  
    window.addEventListener("touchstart", touchStart, options);
  
    return () => window.removeEventListener("touchstart", touchStart, options);
}
preventBrowserHistorySwipeGestures();