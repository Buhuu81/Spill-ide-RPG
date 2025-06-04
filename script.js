// script.js

// Selectors for initial choice images from HTML
const maleChoiceImage = document.querySelector(".male");
const femaleChoiceImage = document.querySelector(".female");

// Game state variables
let hp = 100;       // Base HP for the player
let enemyHp = 150;  // Enemy's starting HP
let isFemaleCharacterSelected = false;
let currentPlayerHp = 100; // Tracks player's HP during the fight
let currentEnemyHp = 150; // Tracks enemy's HP during the fight

// --- Initial Checks (for debugging) ---
if (maleChoiceImage && femaleChoiceImage) {
    console.log("Male and Female choice images found.");
} else {
    console.error("Could not find .male or .female choice images. Check HTML class names and image paths.");
}

// --- Event Listeners for Character Choice ---
if (maleChoiceImage) {
    maleChoiceImage.addEventListener("click", () => {
        console.log("Male character chosen");
        currentPlayerHp = 100 + 20; // Male gets +20 HP
        isFemaleCharacterSelected = false;
        console.log("Player HP set to:", currentPlayerHp);
        startFight();
    });
}

if (femaleChoiceImage) {
    femaleChoiceImage.addEventListener("click", () => {
        console.log("Female character chosen");
        currentPlayerHp = 100; // Female HP is the base 100
        isFemaleCharacterSelected = true;
        console.log("Player HP set to:", currentPlayerHp);
        startFight();
    });
}

// --- Game Setup Function ---
function startFight() {
    console.log("startFight() called. Player HP:", currentPlayerHp, "Female Selected:", isFemaleCharacterSelected);
    document.body.innerHTML = ""; // Clear the initial choice images

    // Change body justify-content for game screen layout
    document.body.style.justifyContent = 'space-evenly';

    currentEnemyHp = 150; // Reset enemy HP for each new fight (important for future new enemies)

    // --- Player Character Setup ---
    let characterDiv = document.createElement("div");
    characterDiv.classList.add("character");

    let characterSprite = document.createElement("img");
    characterSprite.classList.add("game-sprite");
    if (isFemaleCharacterSelected) {
        characterSprite.src = "images/Female viking.jpg";
        characterSprite.alt = "Female Viking Player";
    } else {
        characterSprite.src = "images/Male viking.jpg";
        characterSprite.alt = "Male Viking Player";
    }
    characterDiv.appendChild(characterSprite);

    let characterHpDisplay = document.createElement("p");
    characterHpDisplay.id = "characterHpDisplay";
    characterHpDisplay.classList.add("hp-text");
    characterHpDisplay.textContent = "Player HP: " + currentPlayerHp;
    characterDiv.appendChild(characterHpDisplay);

    // --- Central Board/Battle Log Setup ---
    let boardDiv = document.createElement("div");
    boardDiv.classList.add("board");

    let battleInfoDiv = document.createElement("div");
    battleInfoDiv.id = "battle";
    let battleRollCharP = document.createElement("p");
    let battleRollEnemyP = document.createElement("p");
    battleRollCharP.id = "battleRollChar";
    battleRollCharP.textContent = "Player Roll: -"; // Changed text for clarity
    battleRollEnemyP.id = "battleRollEnemy";
    battleRollEnemyP.textContent = "Enemy Roll: -";
    battleInfoDiv.appendChild(battleRollCharP);
    battleInfoDiv.appendChild(battleRollEnemyP);
    boardDiv.appendChild(battleInfoDiv);

    let rollButton = document.createElement("button");
    rollButton.textContent = "Roll Dice!"; // Added exclamation
    rollButton.id = "Roll";
    boardDiv.appendChild(rollButton);

    // --- Enemy Setup ---
    let enemyDiv = document.createElement("div");
    enemyDiv.classList.add("enemy");

    let enemySprite = document.createElement("img");
    enemySprite.classList.add("game-sprite");
    enemySprite.src = "Images/Male viking.jpg"; // Placeholder enemy, can be randomized later
    enemySprite.alt = "Enemy Viking";
    enemyDiv.appendChild(enemySprite);

    let enemyHpDisplay = document.createElement("p");
    enemyHpDisplay.id = "enemyHpDisplay";
    enemyHpDisplay.classList.add("hp-text");
    enemyHpDisplay.textContent = `Enemy HP: ${currentEnemyHp}`;
    enemyDiv.appendChild(enemyHpDisplay);

    // --- Append main game elements to the body ---
    document.body.appendChild(characterDiv);
    document.body.appendChild(boardDiv);
    document.body.appendChild(enemyDiv);

    rollButton.addEventListener("click", Roll); // Call the Roll function by reference

    console.log("Game interface with sprites created.");
}

// --- Roll Function ---
function Roll() {
    console.log("Roll() called.");
    let randomNumberChar = Math.floor(Math.random() * 20) + 1;
    const randomNumberEnemy = Math.floor(Math.random() * 20) + 1;

    let finalCharRoll = randomNumberChar; // Store initial roll to modify
    if (isFemaleCharacterSelected) {
        finalCharRoll += 1; // Female gets +1 to her roll
        console.log("Female character +1 roll bonus applied!");
    }

    console.log("Player Final Roll:", finalCharRoll, "Enemy Roll:", randomNumberEnemy);

    const battleRollCharP = document.getElementById("battleRollChar");
    const battleRollEnemyP = document.getElementById("battleRollEnemy");
    if (battleRollCharP) battleRollCharP.textContent = `Player Roll: ${finalCharRoll}`;
    if (battleRollEnemyP) battleRollEnemyP.textContent = `Enemy Roll: ${randomNumberEnemy}`;

    const enemyHpDisplayP = document.getElementById("enemyHpDisplay");
    const characterHpDisplayP = document.getElementById("characterHpDisplay");
    const rollBtn = document.getElementById("Roll");

    // Basic Attack/Damage Logic
    if (finalCharRoll > randomNumberEnemy) { // Player hits
        let damage = Math.floor(Math.random() * 6) + 3; // Example: 1d6 + 3 damage
        console.log(`Player hits enemy for ${damage} damage!`);
        currentEnemyHp -= damage;
        if (currentEnemyHp < 0) currentEnemyHp = 0;

        if (enemyHpDisplayP) enemyHpDisplayP.textContent = `Enemy HP: ${currentEnemyHp}`;
        console.log(`Enemy HP remaining: ${currentEnemyHp}`);

        if (currentEnemyHp === 0) {
            console.log("Enemy defeated!");
            // alert("Enemy defeated!"); // Using alert can be disruptive
            if (battleRollCharP) battleRollCharP.textContent = "ENEMY DEFEATED!";
            if (battleRollEnemyP) battleRollEnemyP.textContent = "VICTORY!";
            if (rollBtn) rollBtn.disabled = true;
            // Here you could trigger logic for next enemy or reward choice
            // offerRewardOrNextEnemy(); // Example function call
        }
    } else if (randomNumberEnemy > finalCharRoll) { // Enemy hits
        let damage = Math.floor(Math.random() * 4) + 1; // Example: 1d4 + 1 damage
        console.log(`Enemy hits player for ${damage} damage!`);
        currentPlayerHp -= damage;
        if (currentPlayerHp < 0) currentPlayerHp = 0;

        if (characterHpDisplayP) characterHpDisplayP.textContent = `Player HP: ${currentPlayerHp}`;
        console.log(`Player HP remaining: ${currentPlayerHp}`);

        if (currentPlayerHp === 0) {
            console.log("Player defeated!");
            // alert("Player defeated! Game Over.");
            if (battleRollCharP) battleRollCharP.textContent = "PLAYER DEFEATED!";
            if (battleRollEnemyP) battleRollEnemyP.textContent = "GAME OVER!";
            if (rollBtn) rollBtn.disabled = true;
        }
    } else { // Tie
        console.log("Rolls are tied! A draw for this round.");
        if (battleRollCharP) battleRollCharP.textContent = "TIE! Rolls: " + finalCharRoll;
        if (battleRollEnemyP) battleRollEnemyP.textContent = "TIE! Rolls: " + randomNumberEnemy;
    }
}

console.log("script.js processed. Initial selectors:", maleChoiceImage, femaleChoiceImage);