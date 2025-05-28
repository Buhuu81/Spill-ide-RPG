const male = document.querySelector(".male")
const female = document.querySelector(".female")

male.addEventListener("click", () => {
 hp = hp + 20
 console.log(hp)
 startFight()
})

female.addEventListener("click",() => {
console.log(hp)
startFight()
})

let hp = 100
console.log(hp)

function startFight(){
    document.body.innerHTML = ""

let board = document.createElement("div")
board.classList.add("board")
document.body.appendChild(board)

let character = document.createElement("div")
character.classList.add("character")
board.appendChild(character)

let enemy = document.createElement("div")
enemy.classList.add("enemy")
document.body.appendChild(enemy)

let button = document.createElement("button")
button.textContent = "Roll"
button.id = "Roll"
board.appendChild(button)


}

function Roll(){
const randomNumber = Math.floor(Math.random() * 6) + 1;
console.log(randomNumber)

}
const roll = document.querySelector("Roll")


roll.addEventListener



