// script.js

// Selectors for initial choice images from HTML
const maleChoiceImage = document.querySelector(".male");
const femaleChoiceImage = document.querySelector(".female");

// Game state variables
let player = {
    baseHp: 100,
    maxHp: 100,
    currentHp: 100,
    rollBonus: 0,
    damageBonus: 0,
    minBaseDamage: 2,
    maxBaseDamage: 5,
    isFemale: false,
    spriteSrc: "" // Will be set on choice
};

const availableUpgrades = [
    {
        id: 'heal_hp',
        name: "Mead of Recovery",
        description: "Heal 25 HP.",
        apply: function() {
            player.currentHp += 25;
            if (player.currentHp > player.maxHp) player.currentHp = player.maxHp;
            console.log("Applied: Heal HP. New HP:", player.currentHp);
            updatePlayerHpDisplay();
        }
    },
    {
        id: 'increase_max_hp',
        name: "Boar's Heart",
        description: "+15 Max HP & Heal.",
        apply: function() {
            player.maxHp += 15;
            player.currentHp += 15;
            if (player.currentHp > player.maxHp) player.currentHp = player.maxHp;
            console.log("Applied: Increase Max HP. New Max HP:", player.maxHp);
            updatePlayerHpDisplay();
        }
    },
    {
        id: 'roll_bonus',
        name: "Odin's Favor",
        description: "+1 to your future rolls.",
        apply: function() {
            player.rollBonus += 1;
            console.log("Applied: Roll Bonus. New bonus:", player.rollBonus);
        }
    },
    {
        id: 'damage_bonus',
        name: "Berserker's Rage",
        description: "+1 to your damage.",
        apply: function() {
            player.damageBonus += 1;
            console.log("Applied: Damage Bonus. New bonus:", player.damageBonus);
        }
    }
];

const allEnemies = [
    {
        name: "Forest Wolf",
        spriteSrc: "images/Woolf.jpg",
        maxHp: 70, // Adjusted from your paste for variety
        minDamage: 3,
        maxDamage: 6
    },
    {
        name: "Enraged Chicken",
        spriteSrc: "images/Chicken.jpg",
        maxHp: 30, // Adjusted
        minDamage: 1,
        maxDamage: 2
    },
    {
        name: "Wild Boar",
        spriteSrc: "images/Boar.jpg",
        maxHp: 100, // Adjusted
        minDamage: 4,
        maxDamage: 8
    },
    {
        name: "Viking Raider",
        spriteSrc: "images/Male viking.jpg", // Uses the male player battle sprite
        maxHp: 120,
        minDamage: 5,
        maxDamage: 9
    }
];

// This object will hold the stats of the CURRENTLY active enemy
let currentEnemy = {
    name: "",
    spriteSrc: "",
    maxHp: 0,
    currentHp: 0,
    minDamage: 0,
    maxDamage: 0
};

// --- Initial Checks ---
if (maleChoiceImage && femaleChoiceImage) {
    console.log("Male and Female choice images found.");
} else {
    console.error("Could not find .male or .female choice images. Check HTML class names and image paths.");
}

// --- Event Listeners for Character Choice ---
if (maleChoiceImage) {
    maleChoiceImage.addEventListener("click", () => {
        player.isFemale = false;
        player.maxHp = player.baseHp + 20;
        player.currentHp = player.maxHp;
        player.rollBonus = 0;
        player.damageBonus = 0;
        player.spriteSrc = "images/Male viking.jpg"; // Male battle image
        console.log("Male character chosen. Player HP:", player.currentHp);
        startFight();
    });
}

if (femaleChoiceImage) {
    femaleChoiceImage.addEventListener("click", () => {
        player.isFemale = true;
        player.maxHp = player.baseHp;
        player.currentHp = player.maxHp;
        player.rollBonus = 1; // Female gets +1 roll bonus
        player.damageBonus = 0;
        player.spriteSrc = "images/Female viking fight.jpg"; // Female battle image
        console.log("Female character chosen. Player HP:", player.currentHp, "Roll bonus:", player.rollBonus);
        startFight();
    });
}

// --- Game UI Update Functions ---
function updatePlayerHpDisplay() {
    const characterHpDisplayP = document.getElementById("characterHpDisplay");
    if (characterHpDisplayP) {
        characterHpDisplayP.textContent = `Player HP: ${player.currentHp}/${player.maxHp}`;
    } else {
        console.error("ERROR: characterHpDisplay element not found during update!");
    }
}

function updateEnemyHpDisplay() {
    const enemyHpDisplayP = document.getElementById("enemyHpDisplay");
    if (enemyHpDisplayP) {
        enemyHpDisplayP.textContent = `Enemy: ${currentEnemy.name} | HP: ${currentEnemy.currentHp}/${currentEnemy.maxHp}`;
    } else {
        console.error("ERROR: enemyHpDisplay element not found during update!");
    }
}

// --- Game Logic Functions ---
function loadRandomEnemy() {
    const randomIndex = Math.floor(Math.random() * allEnemies.length);
    const selectedEnemyTemplate = allEnemies[randomIndex];

    currentEnemy.name = selectedEnemyTemplate.name;
    currentEnemy.spriteSrc = selectedEnemyTemplate.spriteSrc;
    currentEnemy.maxHp = selectedEnemyTemplate.maxHp;
    currentEnemy.currentHp = selectedEnemyTemplate.maxHp; // Start with full HP
    currentEnemy.minDamage = selectedEnemyTemplate.minDamage;
    currentEnemy.maxDamage = selectedEnemyTemplate.maxDamage;

    console.log(`Loaded new enemy: ${currentEnemy.name}`);
}

function startFight() {
    console.log("startFight() called. Player HP:", player.currentHp, "Selected Female:", player.isFemale);
    document.body.innerHTML = "";
    document.body.style.justifyContent = 'space-evenly';

    loadRandomEnemy(); // Load the first random enemy's stats into currentEnemy

    // --- Player Character Setup ---
    let characterDiv = document.createElement("div");
    characterDiv.classList.add("character");
    let characterSprite = document.createElement("img");
    characterSprite.classList.add("game-sprite");
    characterSprite.src = player.spriteSrc; // Uses spriteSrc set during character choice
    characterSprite.alt = player.isFemale ? "Female Viking Player" : "Male Viking Player";
    characterDiv.appendChild(characterSprite);
    let characterHpDisplay = document.createElement("p");
    characterHpDisplay.id = "characterHpDisplay";
    characterHpDisplay.classList.add("hp-text");
    characterDiv.appendChild(characterHpDisplay);
    // Initial HP display set after elements are added to body

    // --- Central Board/Battle Log Setup ---
    let boardDiv = document.createElement("div");
    boardDiv.classList.add("board");
    let battleInfoDiv = document.createElement("div");
    battleInfoDiv.id = "battle";
    let battleRollCharP = document.createElement("p");
    battleRollCharP.id = "battleRollChar";
    battleRollCharP.textContent = "Player Roll: -";
    battleInfoDiv.appendChild(battleRollCharP);
    let battleRollEnemyP = document.createElement("p");
    battleRollEnemyP.id = "battleRollEnemy";
    battleRollEnemyP.textContent = "Enemy Roll: -";
    battleInfoDiv.appendChild(battleRollEnemyP);
    boardDiv.appendChild(battleInfoDiv);
    let rollButton = document.createElement("button");
    rollButton.textContent = "Roll Dice!";
    rollButton.id = "Roll";
    boardDiv.appendChild(rollButton);

    // --- Enemy Setup ---
    let enemyDiv = document.createElement("div");
    enemyDiv.classList.add("enemy");
    let enemySpriteImg = document.createElement("img");
    enemySpriteImg.classList.add("game-sprite");
    enemySpriteImg.src = currentEnemy.spriteSrc; // Uses currentEnemy populated by loadRandomEnemy
    enemySpriteImg.alt = currentEnemy.name;
    enemyDiv.appendChild(enemySpriteImg);
    let enemyHpDisplay = document.createElement("p");
    enemyHpDisplay.id = "enemyHpDisplay";
    enemyHpDisplay.classList.add("hp-text");
    enemyDiv.appendChild(enemyHpDisplay);
    // Initial HP display set after elements are added to body

    // Append main elements
    document.body.appendChild(characterDiv);
    document.body.appendChild(boardDiv);
    document.body.appendChild(enemyDiv);

    // Update HP displays now that elements are in the DOM
    updatePlayerHpDisplay();
    updateEnemyHpDisplay();

    rollButton.addEventListener("click", Roll);
    console.log(`Game interface created. First enemy: ${currentEnemy.name}`);
}

function Roll() {
    console.log("Roll() called.");
    const battleRollCharP = document.getElementById("battleRollChar");
    const battleRollEnemyP = document.getElementById("battleRollEnemy");
    const rollBtn = document.getElementById("Roll");

    let randomNumberChar = Math.floor(Math.random() * 20) + 1;
    const randomNumberEnemy = Math.floor(Math.random() * 20) + 1;
    let finalCharRoll = randomNumberChar + player.rollBonus;

    console.log("Player Base Roll:", randomNumberChar, "Bonus:", player.rollBonus, "Final Roll:", finalCharRoll);
    console.log("Enemy Roll:", randomNumberEnemy);

    if (battleRollCharP) battleRollCharP.textContent = `Player Roll: ${finalCharRoll}`;
    if (battleRollEnemyP) battleRollEnemyP.textContent = `Enemy Roll: ${randomNumberEnemy}`;

    if (finalCharRoll > randomNumberEnemy) { // Player hits
        let baseDamageDealt = Math.floor(Math.random() * (player.maxBaseDamage - player.minBaseDamage + 1)) + player.minBaseDamage;
        let totalDamageDealt = baseDamageDealt + player.damageBonus;
        console.log(`Player hits ${currentEnemy.name} for ${totalDamageDealt} damage!`);
        currentEnemy.currentHp -= totalDamageDealt;
        if (currentEnemy.currentHp < 0) currentEnemy.currentHp = 0;
        updateEnemyHpDisplay();
        console.log(`${currentEnemy.name} HP remaining: ${currentEnemy.currentHp}`);

        if (currentEnemy.currentHp === 0) {
            console.log(`${currentEnemy.name} defeated!`);
            if (rollBtn) rollBtn.disabled = true;
            if (battleRollCharP) battleRollCharP.textContent = "";
            if (battleRollEnemyP) battleRollEnemyP.textContent = "";
            showVictoryBannerAndUpgrades();
        }
    } else if (randomNumberEnemy > finalCharRoll) { // Enemy hits
        let damageTaken = Math.floor(Math.random() * (currentEnemy.maxDamage - currentEnemy.minDamage + 1)) + currentEnemy.minDamage;
        console.log(`${currentEnemy.name} hits player for ${damageTaken} damage!`);
        player.currentHp -= damageTaken;
        if (player.currentHp < 0) player.currentHp = 0;
        updatePlayerHpDisplay();
        console.log(`Player HP remaining: ${player.currentHp}`);

        if (player.currentHp === 0) {
            console.log("Player defeated!");
            if (rollBtn) rollBtn.disabled = true;
            showDefeatSequence();
        }
    } else { // Tie
        console.log("Rolls are tied!");
        if (battleRollCharP) battleRollCharP.textContent = "TIE! Rolls: " + finalCharRoll;
        if (battleRollEnemyP) battleRollEnemyP.textContent = "TIE! Rolls: " + randomNumberEnemy;
    }
}

function showVictoryBannerAndUpgrades() {
    const boardDiv = document.querySelector(".board");
    if (!boardDiv) return;

    const battleInfoDiv = document.getElementById("battle");
    if (battleInfoDiv) battleInfoDiv.style.display = 'none';

    const banner = document.createElement("img");
    banner.src = "images/Victory.jpg";
    banner.alt = "Victory!";
    banner.id = "victoryBanner";
    boardDiv.prepend(banner);

    setTimeout(() => {
        banner.remove();
        if (battleInfoDiv) battleInfoDiv.style.display = 'flex';
        presentUpgradeChoices();
    }, 3000); // Banner shown for 3 seconds
}

function presentUpgradeChoices() {
    const boardDiv = document.querySelector(".board");
    if (!boardDiv) return;

    const battleRollCharP = document.getElementById("battleRollChar");
    const battleRollEnemyP = document.getElementById("battleRollEnemy");
    if (battleRollCharP) battleRollCharP.textContent = "Choose your reward!";
    if (battleRollEnemyP) battleRollEnemyP.textContent = "";

    let upgradeChoicesContainer = document.createElement("div");
    upgradeChoicesContainer.id = "upgradeChoicesContainer";

    let chosenUpgrades = [];
    let availableCopy = [...availableUpgrades];
    for (let i = 0; i < 3 && availableCopy.length > 0; i++) {
        let randomIndex = Math.floor(Math.random() * availableCopy.length);
        chosenUpgrades.push(availableCopy.splice(randomIndex, 1)[0]);
    }

    chosenUpgrades.forEach(upgrade => {
        let upgradeButton = document.createElement("button");
        upgradeButton.classList.add("upgrade-choice-btn");
        upgradeButton.innerHTML = `<strong>${upgrade.name}</strong><br><small>${upgrade.description}</small>`;
        upgradeButton.onclick = () => {
            upgrade.apply(); // This will call updatePlayerHpDisplay if it's an HP upgrade
            upgradeChoicesContainer.remove();
            let nextBattleButton = document.createElement("button");
            nextBattleButton.textContent = "Next Battle!";
            nextBattleButton.id = "nextBattleBtn";
            nextBattleButton.addEventListener("click", prepareNextBattle);
            boardDiv.appendChild(nextBattleButton);
        };
        upgradeChoicesContainer.appendChild(upgradeButton);
    });
    boardDiv.appendChild(upgradeChoicesContainer);
}

function showDefeatSequence() {
    console.log("Showing defeat sequence...");
    const characterDiv = document.querySelector(".character");
    const enemyDiv = document.querySelector(".enemy");
    const boardDiv = document.querySelector(".board");

    if (characterDiv) characterDiv.style.display = 'none';
    if (enemyDiv) enemyDiv.style.display = 'none';
    if (boardDiv) boardDiv.style.display = 'none';

    const defeatBanner = document.createElement("img");
    defeatBanner.src = "images/Defeated.jpg";
    defeatBanner.alt = "Defeated!";
    defeatBanner.id = "defeatBanner";
    document.body.appendChild(defeatBanner);

    setTimeout(resetToStartScreen, 10000); // 10 seconds
}

function resetToStartScreen() {
    console.log("Resetting to start screen...");
    window.location.reload();
}

function prepareNextBattle() {
    console.log("Preparing next battle...");
    const nextBattleButton = document.getElementById("nextBattleBtn");
    if (nextBattleButton) nextBattleButton.remove();

    loadRandomEnemy(); // Load new random enemy data into currentEnemy

    updateEnemyHpDisplay();
    const enemySpriteImg = document.querySelector(".enemy .game-sprite");
    if (enemySpriteImg) {
        enemySpriteImg.src = currentEnemy.spriteSrc;
        enemySpriteImg.alt = currentEnemy.name;
    }

    const battleRollCharP = document.getElementById("battleRollChar");
    const battleRollEnemyP = document.getElementById("battleRollEnemy");
    if (battleRollCharP) battleRollCharP.textContent = "Player Roll: -";
    if (battleRollEnemyP) battleRollEnemyP.textContent = "Enemy Roll: -";

    const rollBtn = document.getElementById("Roll");
    if (rollBtn) rollBtn.disabled = false;

    console.log(`Next battle ready against: ${currentEnemy.name}!`);
}

console.log("script.js processed.");