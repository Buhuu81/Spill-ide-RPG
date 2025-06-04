// script.js

// --- DOM Selectors for Initial Choice ---
const maleChoiceImage = document.querySelector(".male");
const femaleChoiceImage = document.querySelector(".female");

// --- Game State Variables ---
let player = {
    baseHp: 100,
    maxHp: 100,
    currentHp: 100,
    rollBonus: 0,
    damageBonus: 0,
    minBaseDamage: 2,
    maxBaseDamage: 5,
    isFemale: false,
    spriteSrc: ""
};

const availableUpgrades = [
    {
        id: 'heal_hp', name: "Mead of Recovery", description: "Heal 25 HP.",
        apply: function() {
            player.currentHp += 25;
            if (player.currentHp > player.maxHp) player.currentHp = player.maxHp;
            console.log("Applied: Heal HP. New HP:", player.currentHp);
            updatePlayerHpDisplay();
        }
    },
    {
        id: 'increase_max_hp', name: "Boar's Heart", description: "+15 Max HP & Heal.",
        apply: function() {
            player.maxHp += 15;
            player.currentHp += 15;
            if (player.currentHp > player.maxHp) player.currentHp = player.maxHp;
            console.log("Applied: Increase Max HP. New Max HP:", player.maxHp);
            updatePlayerHpDisplay();
        }
    },
    {
        id: 'roll_bonus', name: "Odin's Favor", description: "+1 to your rolls.",
        apply: function() {
            player.rollBonus += 1;
            console.log("Applied: Roll Bonus. New bonus:", player.rollBonus);
            updatePlayerBonusesDisplay();
        }
    },
    {
        id: 'damage_bonus', name: "Berserker's Rage", description: "+1 to damage.",
        apply: function() {
            player.damageBonus += 1;
            console.log("Applied: Damage Bonus. New bonus:", player.damageBonus);
            updatePlayerBonusesDisplay();
        }
    }
];

const allEnemies = [
    { name: "Forest Wolf", spriteSrc: "images/Woolf.jpg", maxHp: 70, minDamage: 3, maxDamage: 6 },
    { name: "Enraged Chicken", spriteSrc: "images/Chicken.jpg", maxHp: 30, minDamage: 1, maxDamage: 2 },
    { name: "Wild Boar", spriteSrc: "images/Boar.jpg", maxHp: 100, minDamage: 4, maxDamage: 8 },
    { name: "Viking Raider", spriteSrc: "images/Male viking.jpg", maxHp: 120, minDamage: 5, maxDamage: 9 }
];

const bossStatsTemplate = {
    name: "Jörmungandr", // Simpler name for display
    spriteSrc: "images/Jorrmungandir.jpg",
    maxHp: 400,
    minDamage: 10,
    maxDamage: 20
};

let currentEnemy = { name: "", spriteSrc: "", maxHp: 0, currentHp: 0, minDamage: 0, maxDamage: 0 };
let enemiesDefeated = 0;
const BOSS_DEFEAT_THRESHOLD = 20; // Set to 2 or 3 for easier testing
let bossEncounteredThisRun = false;

// --- Initial Setup Checks ---
if (!maleChoiceImage || !femaleChoiceImage) {
    console.error("Initial choice images not found! Check HTML classes '.male' and '.female'.");
} else {
    console.log("Male and Female choice images found.");
    maleChoiceImage.addEventListener("click", () => selectCharacter(false));
    femaleChoiceImage.addEventListener("click", () => selectCharacter(true));
}

// --- Character Selection ---
function selectCharacter(isFemale) {
    player.isFemale = isFemale;
    player.maxHp = player.baseHp + (isFemale ? 0 : 20); // Male gets +20 HP
    player.currentHp = player.maxHp;
    player.rollBonus = isFemale ? 1 : 0; // Female gets +1 roll
    player.damageBonus = 0;
    player.spriteSrc = isFemale ? "images/Female viking fight.jpg" : "images/Male viking.jpg";
    
    console.log(`${isFemale ? "Female" : "Male"} character chosen. Player HP: ${player.currentHp}, Roll Bonus: ${player.rollBonus}`);
    startFight();
}

// --- UI Update Functions ---
function updatePlayerHpDisplay() {
    const display = document.getElementById("characterHpDisplay");
    if (display) display.textContent = `Player HP: ${player.currentHp}/${player.maxHp}`;
}

function updateEnemyHpDisplay() {
    const display = document.getElementById("enemyHpDisplay");
    if (display) display.textContent = `Enemy: ${currentEnemy.name} | HP: ${currentEnemy.currentHp}/${currentEnemy.maxHp}`;
}

function updatePlayerBonusesDisplay() {
    const display = document.getElementById("playerBonusesDisplay");
    if (display) {
        let bonuses = [];
        if (player.rollBonus !== 0) bonuses.push(`Roll: ${player.rollBonus > 0 ? '+' : ''}${player.rollBonus}`);
        if (player.damageBonus !== 0) bonuses.push(`Dmg: ${player.damageBonus > 0 ? '+' : ''}${player.damageBonus}`);
        display.textContent = bonuses.length > 0 ? `Bonuses: ${bonuses.join(' | ')}` : "Bonuses: None";
    }
}

function updateDefeatCounterDisplay() {
    const display = document.getElementById("defeatCounterDisplay");
    if (display) {
        if (currentEnemy.name === bossStatsTemplate.name) {
            display.textContent = `FINAL BOSS: ${currentEnemy.name}!`;
        } else if (bossEncounteredThisRun) {
             display.textContent = `Path Cleared! Face Jörmungandr!`;
        } else {
            display.textContent = `Enemies Defeated: ${enemiesDefeated} / ${BOSS_DEFEAT_THRESHOLD}`;
        }
    }
}

// --- Game Logic Functions ---
function loadRandomEnemy() {
    const randomIndex = Math.floor(Math.random() * allEnemies.length);
    const template = allEnemies[randomIndex];
    Object.assign(currentEnemy, template, { currentHp: template.maxHp }); // Copy template and reset HP
    console.log(`Loaded random enemy: ${currentEnemy.name}`);
}

function loadBoss() {
    Object.assign(currentEnemy, bossStatsTemplate, { currentHp: bossStatsTemplate.maxHp });
    bossEncounteredThisRun = true;
    console.log(`BOSS LOADED: ${currentEnemy.name}`);
}

function startFight() {
    console.log("startFight() called.");
    document.body.innerHTML = ""; // Clear previous screen
    document.body.style.justifyContent = 'space-evenly';

    // Add Defeat Counter Display
    let defeatCounterDisplay = document.createElement("div");
    defeatCounterDisplay.id = "defeatCounterDisplay";
    document.body.prepend(defeatCounterDisplay); // Prepend to ensure it's at the top

    // Determine if it's boss time or random enemy for the first fight
    if (enemiesDefeated >= BOSS_DEFEAT_THRESHOLD && !bossEncounteredThisRun) {
        loadBoss();
    } else {
        loadRandomEnemy();
    }
    // Initial UI updates after loading enemy and before creating elements that depend on it
    updateDefeatCounterDisplay();


    // Create Player UI
    let characterDiv = document.createElement("div");
    characterDiv.classList.add("character");
    let characterSprite = document.createElement("img");
    characterSprite.classList.add("game-sprite");
    characterSprite.src = player.spriteSrc;
    characterSprite.alt = player.isFemale ? "Female Viking" : "Male Viking";
    characterDiv.appendChild(characterSprite);
    let characterHpDisplay = document.createElement("p");
    characterHpDisplay.id = "characterHpDisplay";
    characterHpDisplay.classList.add("hp-text");
    characterDiv.appendChild(characterHpDisplay);
    let playerBonusesDisplay = document.createElement("p");
    playerBonusesDisplay.id = "playerBonusesDisplay";
    playerBonusesDisplay.classList.add("bonus-text");
    characterDiv.appendChild(playerBonusesDisplay);

    // Create Board UI
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

    // Create Enemy UI
    let enemyDiv = document.createElement("div");
    enemyDiv.classList.add("enemy");
    let enemySpriteImg = document.createElement("img");
    enemySpriteImg.classList.add("game-sprite");
    enemySpriteImg.src = currentEnemy.spriteSrc;
    enemySpriteImg.alt = currentEnemy.name;
    enemyDiv.appendChild(enemySpriteImg);
    let enemyHpDisplay = document.createElement("p");
    enemyHpDisplay.id = "enemyHpDisplay";
    enemyHpDisplay.classList.add("hp-text");
    enemyDiv.appendChild(enemyHpDisplay);

    // Append main sections to body
    document.body.appendChild(characterDiv);
    document.body.appendChild(boardDiv);
    document.body.appendChild(enemyDiv);

    // Initial UI Updates
    updatePlayerHpDisplay();
    updatePlayerBonusesDisplay();
    updateEnemyHpDisplay();
    updateDefeatCounterDisplay(); // Call again to ensure text is right if boss spawned first

    rollButton.addEventListener("click", Roll);
    console.log(`Game interface created. Current enemy: ${currentEnemy.name}`);
}

function Roll() {
    console.log("Roll() called.");
    const battleRollCharP = document.getElementById("battleRollChar");
    const battleRollEnemyP = document.getElementById("battleRollEnemy");
    const rollBtn = document.getElementById("Roll");

    if (!rollBtn || rollBtn.disabled) return; // Prevent rolling if button is disabled

    let randomNumberChar = Math.floor(Math.random() * 20) + 1;
    const randomNumberEnemy = Math.floor(Math.random() * 20) + 1;
    let finalCharRoll = randomNumberChar + player.rollBonus;

    console.log(`Player Base Roll: ${randomNumberChar}, Bonus: ${player.rollBonus}, Final: ${finalCharRoll}`);
    console.log(`Enemy Roll: ${randomNumberEnemy}`);

    if (battleRollCharP) battleRollCharP.textContent = `Player Roll: ${finalCharRoll}`;
    if (battleRollEnemyP) battleRollEnemyP.textContent = `Enemy Roll: ${randomNumberEnemy}`;

    if (finalCharRoll > randomNumberEnemy) { // Player hits
        let baseDmg = Math.floor(Math.random() * (player.maxBaseDamage - player.minBaseDamage + 1)) + player.minBaseDamage;
        let totalDmg = baseDmg + player.damageBonus;
        console.log(`Player hits ${currentEnemy.name} for ${totalDmg} damage!`);
        currentEnemy.currentHp -= totalDmg;
        if (currentEnemy.currentHp < 0) currentEnemy.currentHp = 0;
        updateEnemyHpDisplay();

        if (currentEnemy.currentHp === 0) {
            console.log(`${currentEnemy.name} defeated!`);
            if (rollBtn) rollBtn.disabled = true;
            if (battleRollCharP) battleRollCharP.textContent = "";
            if (battleRollEnemyP) battleRollEnemyP.textContent = "";
            handleVictory();
        }
    } else if (randomNumberEnemy > finalCharRoll) { // Enemy hits
        let enemyDmg = Math.floor(Math.random() * (currentEnemy.maxDamage - currentEnemy.minDamage + 1)) + currentEnemy.minDamage;
        console.log(`${currentEnemy.name} hits player for ${enemyDmg} damage!`);
        player.currentHp -= enemyDmg;
        if (player.currentHp < 0) player.currentHp = 0;
        updatePlayerHpDisplay();

        if (player.currentHp === 0) {
            console.log("Player defeated!");
            if (rollBtn) rollBtn.disabled = true;
            showDefeatSequence();
        }
    } else { // Tie
        console.log("Rolls are tied!");
        if (battleRollCharP) battleRollCharP.textContent = `TIE! Rolls: ${finalCharRoll}`;
        if (battleRollEnemyP) battleRollEnemyP.textContent = `TIE! Rolls: ${randomNumberEnemy}`;
    }
}

function handleVictory() {
    const boardDiv = document.querySelector(".board");
    if (!boardDiv) return;

    const battleInfoDiv = document.getElementById("battle");
    const rollBtn = document.getElementById("Roll"); // Ensure rollBtn is disabled here too
    if (rollBtn) rollBtn.disabled = true;
    if (battleInfoDiv) battleInfoDiv.style.display = 'none';

    if (currentEnemy.name === bossStatsTemplate.name) { // Boss defeated
        const banner = document.createElement("img");
        banner.src = "images/Victory.jpg";
        banner.alt = "JÖRMUNGANDR DEFEATED!";
        banner.id = "victoryBanner";
        banner.style.border = "5px solid gold";
        boardDiv.innerHTML = ""; // Clear board for final message
        boardDiv.appendChild(banner);
        let victoryMsg = document.createElement("p");
        victoryMsg.textContent = "The World Serpent is vanquished! Your legend echoes!";
        victoryMsg.style.color = "gold"; victoryMsg.style.fontSize = "20px"; victoryMsg.style.textAlign = "center";
        boardDiv.appendChild(victoryMsg);
        let playAgainBtn = document.createElement("button");
        playAgainBtn.textContent = "Play Again?";
        playAgainBtn.id = "nextBattleBtn"; // Reuse style
        playAgainBtn.onclick = resetToStartScreen; // Directly call reset
        boardDiv.appendChild(playAgainBtn);
        return;
    }

    // Regular enemy defeated
    if (!bossEncounteredThisRun) { // Only increment if not in "boss mode already cleared path"
        enemiesDefeated++;
    }
    updateDefeatCounterDisplay();

    let chestImg = document.createElement("img");
    chestImg.src = "images/chest.jpg";
    chestImg.alt = "Click to Open Reward Chest";
    chestImg.id = "rewardChest";
    chestImg.classList.add("clickable-chest");
    boardDiv.appendChild(chestImg);

    chestImg.onclick = () => {
        chestImg.src = "images/openchest.jpg";
        chestImg.classList.remove("clickable-chest");
        chestImg.onclick = null;
        setTimeout(() => {
            chestImg.remove();
            if (battleInfoDiv) battleInfoDiv.style.display = 'flex'; // Restore space for upgrades
            presentUpgradeChoices();
        }, 800);
    };
}

function presentUpgradeChoices() {
    const boardDiv = document.querySelector(".board");
    if (!boardDiv) return;

    const battleRollCharP = document.getElementById("battleRollChar");
    if (battleRollCharP) battleRollCharP.textContent = "Choose your boon!";
    const battleRollEnemyP = document.getElementById("battleRollEnemy");
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
    const elementsToHide = [".character", ".enemy", ".board", "#defeatCounterDisplay"];
    elementsToHide.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) el.style.display = 'none';
    });
    document.body.style.justifyContent = 'center'; // Re-center for full screen banner

    const defeatBanner = document.createElement("img");
    defeatBanner.src = "images/Defeated.jpg";
    defeatBanner.alt = "Defeated!";
    defeatBanner.id = "defeatBanner";
    document.body.appendChild(defeatBanner);

    setTimeout(resetToStartScreen, 10000);
}

function resetToStartScreen() {
    console.log("Resetting to start screen...");
    // No need to manually reset global vars if reloading, but good for non-reload scenarios
    // enemiesDefeated = 0;
    // bossEncounteredThisRun = false;
    window.location.reload();
}

function prepareNextBattle() {
    console.log("Preparing next battle...");
    const nextBattleButton = document.getElementById("nextBattleBtn");
    if (nextBattleButton) nextBattleButton.remove();

    if (enemiesDefeated >= BOSS_DEFEAT_THRESHOLD && !bossEncounteredThisRun) {
        loadBoss();
    } else {
        loadRandomEnemy();
    }
    updateDefeatCounterDisplay();

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
    
    const battleInfoDiv = document.getElementById("battle"); // Ensure battle log is visible again
    if (battleInfoDiv) battleInfoDiv.style.display = 'flex';


    const rollBtn = document.getElementById("Roll");
    if (rollBtn) rollBtn.disabled = false;

    console.log(`Next battle ready against: ${currentEnemy.name}!`);
}

console.log("script.js processed and ready.");