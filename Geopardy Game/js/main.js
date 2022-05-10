//initialize the game board on page load
initBoard() //want function to call immediately on load. still defining function below
initCatRow()

//when u click button pulls categories and puts in boxes
document.querySelector('button').addEventListener('click', buildCategories)

//CREATE CATEGORY ROW
function initCatRow () {
    let catRow = document.getElementById('category-row')
    //make 1 row and create 6 boxes to put in the row
    for (let i=0; i<6; i++) {
        let box = document.createElement('div')
        box.className = 'clue-box category-box'  //want both boxes to have same styling
        catRow.appendChild(box)
    }
}

//CREATE CLUE BOARD
function initBoard() {
    let board = document.getElementById('clue-board')

    //generate 5 rows then nest 6 boxes in each row - nested loop
    for (let i = 0; i < 5; i++) {
        let row = document.createElement('div')
        let boxValue = 200 * (i+1)
        row.className = 'clue-row'

        for (let j=0; j < 6; j++) {
            let box = document.createElement('div')
            box.className = 'clue-box'  //attaches to id
            box.textContent = '$' + boxValue //puts text into the box from boxValue
            //box.appendChild (document.createTextNode(boxValue) // backward compatible)
            box.addEventListener('click', getClue, false)

            //put box inside the row
            row.appendChild(box)
        }
        board.appendChild(row) //attach each row in the board
    }
}

//CALL API 
//gen random number between 1 and max category num in api  18418
function randInt() {
    return Math.floor(Math.random() * (18418) + 1)
}

//add api. want to generate random category and clues inside to match dollar amount
//pull from api 6 times and store in array to populate categories and clues. Will save data in global variable. parse in json
//can loop but need promise without async/await in parallel (all at same time) - sequential means wait till each finish then run next

let catArray = []  //need a global variable. below array is only local

function buildCategories(){

    //check to see if cat row has text inside to see if reset board
    if(!(document.getElementById('category-row').firstChild.innerText == '')){
        resetBoard()
    }


    const fetchReq1 = fetch(`https://jservice.io/api/category?&id=${randInt()}`).then((res) => res.json());
    const fetchReq2 = fetch(`https://jservice.io/api/category?&id=${randInt()}`).then((res) => res.json());
    const fetchReq3 = fetch(`https://jservice.io/api/category?&id=${randInt()}`).then((res) => res.json());
    const fetchReq4 = fetch(`https://jservice.io/api/category?&id=${randInt()}`).then((res) => res.json());
    const fetchReq5 = fetch(`https://jservice.io/api/category?&id=${randInt()}`).then((res) => res.json());
    const fetchReq6 = fetch(`https://jservice.io/api/category?&id=${randInt()}`).then((res) => res.json());  //get result then parse as json

    //populate array when all fetches are complete then dump data into array
    const allData = Promise.all([fetchReq1, fetchReq2, fetchReq3, fetchReq4, fetchReq5, fetchReq6])
    allData.then((res) => {
        console.log(res) //can see categories with q/a in console.log to finish board
        catArray = res //can now use else where in code
        setCategories(catArray) //when click new game, api calls, create array of data, and puts title in boxes
    })
}

//RESET BOARD AND DOLLAR AMT IF NEEDED
function resetBoard(){
    let clueParent = document.getElementById('clue-board')
    //look at board, remove children. remove nested children. if first child exist...remove
    while(clueParent.firstChild){
        clueParent.removeChild(clueParent.firstChild)
    }
    let catParent = document.getElementById('category-row')
    while(catParent.firstChild){
        catParent.removeChild(catParent.firstChild)
    }
    document.getElementById('score').innerText = 0
    initBoard()
    initCatRow()
}

//LOAD CATEGORIES TO THE BOARD

//go into array and get title of each category to insert into DOM
function setCategories (catArray) {
    let element = document.getElementById('category-row')
        let children = element.children; //loop through 6 child boxes
        for(let i=0; i<children.length; i++){
            children[i].innerHTML = catArray[i].title //for each child element, set innerhtml = to catArray item title
        }
}

//FIGURE OUT WHICH ITEM WAS CLICKED
//all items on board has event listener, how to tell which box is clicked? event target
//when click pass in info about the click
function getClue(event){
    let child = event.currentTarget
    child.classList.add('clicked-box') //add class to item clicked. click-box made font size smaller earlier
    let boxValue = child.innerHTML.slice(1)  //extract value of item clicked and remove the first $
    //look for box that was clicked. find the parent. prototype looks at relationship between child and parent
    //look at each row as array in each value row
    let parent = child.parentNode //which column was clicked item located
    let index = Array.prototype.findIndex.call(parent.children, (c) => c === child) 


    //know which category we want to go in and now find correct value box
    let cluesList = catArray[index].clues
    //pinpoint correct clue to display according to the value in box
    let clue = cluesList.find(obj => {
        return obj.value == boxValue
    })
    console.log(clue)
    //will pass through the clue, which box, and value of box
    showQuestion(clue, child, boxValue)
}

//SHOW USER CLUE/QUESTIONS AND GET ANSWER
function showQuestion(clue, child, boxValue){
    //show them clue. pull question property out of the clue 
    let userAnswer = prompt(clue.question).toLowerCase()
    let correctAnswer = clue.answer.toLowerCase().replace(/<\/?[^>]+(>|$)/g, "")
    let possiblePoints = +(boxValue) //+ unary operator set string to a number
    target.innerHTML = clue.answer //set inner html of box clicked to the answer
    target.removeEventListener('click', getClue, false) //removes ability to click the box again 
    evaluateAnswer(userAnswer, correctAnswer, possiblePoints) 
}

//EVAL ANSWER AND SHOW TO USER TO CONFIRM
function evaluateAnswer(userAnswer, correctAnswer, possiblePoints){
    let checkAnswer = (userAnswer == correctAnswer) ? 'correct' : 'incorrect' //if user equal to correct then correct
    let confirmAnswer = 
    confirm(`For $${possiblePoints}, you answered "${userAnswer}", and the correct answer was "${correctAnswer}". Your
    answer appears to be ${checkAnswer}. Click Ok to accept and Cancel if the answer was not correct.`)
    awardPoints(checkAnswer, confirmAnswer, possiblePoints)
}

//AWARD POINTS
function awardPoints(checkAnswer, confirmAnswer, possiblePoints){
    if(!(checkAnswer == 'incorrect' && confirmAnswer == true)) {
        //award points. checks score, add score
        let target = document.getElementById('score')
        let currentScore = +(target.innerText)
        currentScore += possiblePoints
        target.innerText = currentScore 
     }else{
         alert(`No points awarded.`)
     }
}