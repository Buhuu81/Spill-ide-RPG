// bestemmer hvlken verdi som er i male og female.
// i dette tilfelle, ser det i document, etter et element som har har klassen male
// query selector ser etter første element som har denne klassen
const male = document.querySelector(".male")
const female = document.querySelector(".female")

/* knapper som viser til handing som skjer ved trykk på div element*/
// male får 20 extra hp //
male.addEventListener("click", () => {
 hp = hp + 20
 console.log(hp)
 startFight()
})

female.addEventListener("click",() => {
console.log(hp)

//female skal få pluss en i roll
startFight()
})

let hp = 100
console.log(hp)

function startFight(){
document.body.innerHTML = ""

let board = document.createElement("div")
board.classList.add("board")
document.body.appendChild(board)

let characterHp = document.createElement("p")
characterHp.textContent = hp
board.appendChild(characterHp)

let character = document.createElement("div")
character.classList.add("character")
board.appendChild(character)

let battle = document.createElement("div") 
let battleRollChar = document.createElement("p")
let battleRollEnemy = document.createElement("p")
battle.id = "battle"
battleRollChar.id = "battleRollChar"
battleRollEnemy.id = "battleRollEnemy"
document.body.appendChild(battle)
battle.appendChild(battleRollChar)
battle.appendChild(battleRollEnemy)


let enemy = document.createElement("div")
enemy.classList.add("enemy")
document.body.appendChild(enemy)

let button = document.createElement("button")
button.textContent = "Roll"
button.id = "Roll"
board.appendChild(button)

const roll = document.querySelector("#Roll")
roll.addEventListener("click",() => {
    Roll()
    
        }) 

}
function Roll() {
    const randomNumberChar = Math.floor(Math.random() * 20) + 1;
    const randomNumberEnemy = Math.floor(Math.random() * 20) + 1;

    console.log(randomNumberChar, randomNumberEnemy);

    // Updating the elements with roll results //
    document.getElementById("battleRollChar").textContent = `Character Roll: ${randomNumberChar}`;
    document.getElementById("battleRollEnemy").textContent = `Enemy Roll: ${randomNumberEnemy}`;
}

/*function Roll(){
const randomNumberChar = Math.floor(Math.random() * 6) + 1;

const randomNumberEnemy = Math.floor(Math.random() * 6) + 1;
console.log(randomNumberChar, randomNumberEnemy)

}*/









