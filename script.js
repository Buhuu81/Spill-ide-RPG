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
            updatePlayerHpDisplay(); // Update display
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
            updatePlayerHpDisplay(); // Update display
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

let enemyStats = {
    name: "Viking Raider", // Changed name slightly for variety
    maxHp: 150,
    currentHp: 150,
    spriteSrc: "images/Male viking.jpg" // Default enemy sprite (Male battle image)
};

// --- Initial Checks ---
if (maleChoiceImage && femaleChoiceImage) {
    console.log("Male and Female choice images found.");
} else {
    console.error("Could not find .male or .female choice images. Check HTML class names and ensure script runs after elements are loaded (module script does this).");
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

// script.js

// ... (your existing const maleChoiceImage, femaleChoiceImage, player object, availableUpgrades, enemyStats, event listeners) ...

// --- Game UI Update Functions ---
function updatePlayerHpDisplay() {
    const characterHpDisplayP = document.getElementById("characterHpDisplay");
    // console.log("Attempting to update player HP. Element found:", characterHpDisplayP); // For debugging
    if (characterHpDisplayP) {
        characterHpDisplayP.textContent = `Player HP: ${player.currentHp}/${player.maxHp}`;
        // console.log("Player HP display updated to:", characterHpDisplayP.textContent); // For debugging
    } else {
        console.error("ERROR: characterHpDisplay element not found!");
    }
}

function updateEnemyHpDisplay() {
    const enemyHpDisplayP = document.getElementById("enemyHpDisplay");
    // console.log("Attempting to update enemy HP. Element found:", enemyHpDisplayP); // For debugging
    if (enemyHpDisplayP) {
        enemyHpDisplayP.textContent = `Enemy HP: ${enemyStats.currentHp}/${enemyStats.maxHp}`;
        // console.log("Enemy HP display updated to:", enemyHpDisplayP.textContent); // For debugging
    } else {
        console.error("ERROR: enemyHpDisplay element not found!");
    }
}

// --- Game Setup Function ---
function startFight() {
    console.log("startFight() called. Player HP:", player.currentHp, "Female Selected:", player.isFemale);
    document.body.innerHTML = ""; // Clear initial choice images
    document.body.style.justifyContent = 'space-evenly'; // For game screen layout

    enemyStats.currentHp = enemyStats.maxHp; // Reset enemy HP

    // --- Player Character Setup ---
    let characterDiv = document.createElement("div");
    characterDiv.classList.add("character");

    let characterSprite = document.createElement("img");
    characterSprite.classList.add("game-sprite");
    characterSprite.src = player.spriteSrc; // Uses path set during character selection
    characterSprite.alt = player.isFemale ? "Female Viking Player" : "Male Viking Player";
    characterDiv.appendChild(characterSprite);

    let characterHpDisplay = document.createElement("p");
    characterHpDisplay.id = "characterHpDisplay"; // ID for querySelector
    characterHpDisplay.classList.add("hp-text");
    // Text will be set by updatePlayerHpDisplay() after characterDiv is in the DOM
    characterDiv.appendChild(characterHpDisplay);

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
    enemySpriteImg.src = enemyStats.spriteSrc;
    enemySpriteImg.alt = enemyStats.name;
    enemyDiv.appendChild(enemySpriteImg);

    let enemyHpDisplay = document.createElement("p");
    enemyHpDisplay.id = "enemyHpDisplay"; // ID for querySelector
    enemyHpDisplay.classList.add("hp-text");
    // Text will be set by updateEnemyHpDisplay() after enemyDiv is in the DOM
    enemyDiv.appendChild(enemyHpDisplay);

    // --- Append main game elements to the body FIRST ---
    document.body.appendChild(characterDiv);
    document.body.appendChild(boardDiv);
    document.body.appendChild(enemyDiv);

    // --- THEN update the HP displays ---
    // Now that the elements are definitely in the main document, getElementById should reliably find them.
    updatePlayerHpDisplay();
    updateEnemyHpDisplay();

    rollButton.addEventListener("click", Roll);
    console.log("Game interface created. HP displays should be populated.");
}

// ... (Your Roll() function, showVictoryBannerAndUpgrades(), presentUpgradeChoices(), showDefeatSequence(), resetToStartScreen(), prepareNextBattle() functions remain the same as the last complete version) ...

console.log("script.js processed.");

// --- Battle Logic Function ---
function Roll() {
    console.log("Roll() called.");
    let randomNumberChar = Math.floor(Math.random() * 20) + 1;
    const randomNumberEnemy = Math.floor(Math.random() * 20) + 1;
    let finalCharRoll = randomNumberChar + player.rollBonus;

    console.log("Player Base Roll:", randomNumberChar, "Bonus:", player.rollBonus, "Final Roll:", finalCharRoll);
    console.log("Enemy Roll:", randomNumberEnemy);

    const battleRollCharP = document.getElementById("battleRollChar");
    const battleRollEnemyP = document.getElementById("battleRollEnemy");
    if (battleRollCharP) battleRollCharP.textContent = `Player Roll: ${finalCharRoll}`;
    if (battleRollEnemyP) battleRollEnemyP.textContent = `Enemy Roll: ${randomNumberEnemy}`;

    const rollBtn = document.getElementById("Roll");

    if (finalCharRoll > randomNumberEnemy) { // Player hits
        let baseDamageDealt = Math.floor(Math.random() * (player.maxBaseDamage - player.minBaseDamage + 1)) + player.minBaseDamage;
        let totalDamageDealt = baseDamageDealt + player.damageBonus;
        console.log(`Player hits enemy for ${totalDamageDealt} damage!`);
        enemyStats.currentHp -= totalDamageDealt;
        if (enemyStats.currentHp < 0) enemyStats.currentHp = 0;
        updateEnemyHpDisplay();
        console.log(`Enemy HP remaining: ${enemyStats.currentHp}`);

        if (enemyStats.currentHp === 0) {
            console.log("Enemy defeated!");
            if (rollBtn) rollBtn.disabled = true;
            if (battleRollCharP) battleRollCharP.textContent = "";
            if (battleRollEnemyP) battleRollEnemyP.textContent = "";
            showVictoryBannerAndUpgrades();
        }
    } else if (randomNumberEnemy > finalCharRoll) { // Enemy hits
        let damageTaken = Math.floor(Math.random() * 4) + 2; // Enemy damage: 1d4 + 2 (example)
        console.log(`Enemy hits player for ${damageTaken} damage!`);
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

// --- Post-Battle Sequence Functions ---
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
            upgrade.apply();
            // updatePlayerHpDisplay(); // Already called within upgrade.apply() for HP upgrades
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

    // TODO: Implement logic for selecting a new/random enemy and updating enemyStats
    // For now, just reset the current enemy type.
    enemyStats.currentHp = enemyStats.maxHp;
    // enemyStats.spriteSrc = "images/new_enemy.jpg"; // Example for later
    // enemyStats.name = "New Enemy Type";

    updateEnemyHpDisplay();
    const enemySpriteImg = document.querySelector(".enemy .game-sprite"); // Select the enemy's sprite
    if (enemySpriteImg) enemySpriteImg.src = enemyStats.spriteSrc; // Update src if it changed

    const battleRollCharP = document.getElementById("battleRollChar");
    const battleRollEnemyP = document.getElementById("battleRollEnemy");
    if (battleRollCharP) battleRollCharP.textContent = "Player Roll: -";
    if (battleRollEnemyP) battleRollEnemyP.textContent = "Enemy Roll: -";

    const rollBtn = document.getElementById("Roll");
    if (rollBtn) rollBtn.disabled = false;

    console.log("Next battle ready!");
}

console.log("script.js processed.");