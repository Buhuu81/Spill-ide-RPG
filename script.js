// script.js

// --- DOM Selectors for Initial Choice ---
const maleChoiceImage = document.querySelector(".male");
const femaleChoiceImage = document.querySelector(".female");

// --- Game State Variables ---
let player = {
    baseHp: 200, // User updated
    maxHp: 200,  // Will be set based on baseHp + gender bonus
    currentHp: 200, // Will be set based on baseHp + gender bonus
    rollBonus: 0,
    damageBonus: 0,
    minBaseDamage: 5, // User updated
    maxBaseDamage: 6, // User updated
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
    { name: "Forest Wolf", spriteSrc: "images/Woolf.jpg", maxHp: 35, minDamage: 0, maxDamage: 4 },
    { name: "Enraged Chicken", spriteSrc: "images/Chicken.jpg", maxHp: 15, minDamage: 0, maxDamage: 1 },
    { name: "Wild Boar", spriteSrc: "images/Boar.jpg", maxHp: 30, minDamage: 0, maxDamage: 2 },
    { name: "Draug", spriteSrc: "images/Draug.jpg", maxHp: 45, minDamage: 2, maxDamage: 5 }
    // Note: The "Viking Raider" from your previous allEnemies list used "images/Male viking.jpg".
    // If you still want it, add it back here.
    // { name: "Viking Raider", spriteSrc: "images/Male viking.jpg", maxHp: 120, minDamage: 5, maxDamage: 9 }
];

const bossStatsTemplate = {
    name: "Jörmungandr",
    spriteSrc: "images/Jorrmungandir.jpg",
    maxHp: 200, // User updated boss HP
    minDamage: 5, // User updated boss damage
    maxDamage: 10
};

// This object will hold the stats of the CURRENTLY active enemy
let currentEnemy = {
    name: "",
    spriteSrc: "",
    maxHp: 0,
    currentHp: 0,
    minDamage: 0,
    maxDamage: 0
};

let enemiesDefeated = 0;
const BOSS_DEFEAT_THRESHOLD = 20; // Or a smaller number like 2-3 for testing
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
    player.maxHp = player.baseHp + (isFemale ? 0 : 20);
    player.currentHp = player.maxHp;
    player.rollBonus = isFemale ? 1 : 0;
    player.damageBonus = 0;
    // These are the in-battle sprites, not the initial choice "Front flex" images
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
    if (display) {
        // Use currentEnemy for displaying enemy details
        display.textContent = `Enemy: ${currentEnemy.name} | HP: ${currentEnemy.currentHp}/${currentEnemy.maxHp}`;
    }
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
        } else if (bossEncounteredThisRun) { // Means path to boss is clear or boss was just loaded
             display.textContent = `Path Cleared! Face Jörmungandr!`;
        } else {
            display.textContent = `Enemies Defeated: ${enemiesDefeated} / ${BOSS_DEFEAT_THRESHOLD}`;
        }
    }
}

// --- Game Logic Functions ---
function loadRandomEnemy() {
    if (allEnemies.length === 0) {
        console.error("No enemies defined in allEnemies array!");
        // Fallback to a default enemy if allEnemies is empty, or handle error
        Object.assign(currentEnemy, { name: "Lost Soul", spriteSrc: "images/default_enemy.jpg", maxHp: 50, currentHp: 50, minDamage: 1, maxDamage: 3});
        return;
    }
    const randomIndex = Math.floor(Math.random() * allEnemies.length);
    const template = allEnemies[randomIndex];
    // Deep copy template and set currentHp to maxHp for the new encounter
    Object.assign(currentEnemy, JSON.parse(JSON.stringify(template)), { currentHp: template.maxHp });
    console.log(`Loaded random enemy: ${currentEnemy.name}`);
}

function loadBoss() {
    // Deep copy template and set currentHp to maxHp
    Object.assign(currentEnemy, JSON.parse(JSON.stringify(bossStatsTemplate)), { currentHp: bossStatsTemplate.maxHp });
    bossEncounteredThisRun = true;
    console.log(`BOSS LOADED: ${currentEnemy.name}`);
}

function showHitEffect(targetContainerElement, damageAmount) {
    if (!targetContainerElement) {
        console.error("Target container for hit effect not found!");
        return;
    }

    // Create Hit Marker Sprite
    const hitMarker = document.createElement("img");
    hitMarker.src = "images/hit.png"; // Ensure you have 'images/hit.png'
    hitMarker.classList.add("hit-marker-sprite");
    hitMarker.alt = "Hit!";

    // Create Damage Text
    const damageText = document.createElement("p"); // Using <p> for semantic text
    damageText.classList.add("damage-text-popup");
    damageText.textContent = `-${damageAmount}`;

    // Append to the target's main container div (.character or .enemy)
    targetContainerElement.appendChild(hitMarker);
    targetContainerElement.appendChild(damageText);

    // Remove elements after animation (duration should roughly match CSS animation)
    // The CSS animation has `forwards`, so they'll stay at their end state (opacity: 0)
    // But removing them from DOM is good for performance.
    const animationCSSDuration = 700; // Match longest animation (damageTextAnim is 0.7s)
    setTimeout(() => {
        if (hitMarker.parentNode) {
            hitMarker.remove();
        }
        if (damageText.parentNode) {
            damageText.remove();
        }
    }, animationCSSDuration);
}

function startFight() {
    console.log("startFight() called. Player HP:", player.currentHp);
    document.body.innerHTML = ""; // Clear initial choice images
    document.body.style.justifyContent = 'space-evenly'; // For game screen layout

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
    // updateDefeatCounterDisplay(); // Called later after all UI is appended

    // --- Player Character Setup ---
    let characterDiv = document.createElement("div");
    characterDiv.classList.add("character");
    let characterSprite = document.createElement("img");
    characterSprite.classList.add("game-sprite");
    characterSprite.src = player.spriteSrc;
    characterSprite.alt = player.isFemale ? "Female Viking Player" : "Male Viking Player";
    characterDiv.appendChild(characterSprite);
    let characterHpDisplay = document.createElement("p");
    characterHpDisplay.id = "characterHpDisplay";
    characterHpDisplay.classList.add("hp-text");
    characterDiv.appendChild(characterHpDisplay);
    let playerBonusesDisplay = document.createElement("p");
    playerBonusesDisplay.id = "playerBonusesDisplay";
    playerBonusesDisplay.classList.add("bonus-text");
    characterDiv.appendChild(playerBonusesDisplay);

    // --- Central Board/Battle Log Setup ---
    let boardDiv = document.createElement("div");
    boardDiv.classList.add("board");
    let battleInfoDiv = document.createElement("div");
    battleInfoDiv.id = "battle";

    let playerDieAnim = document.createElement("img");
    playerDieAnim.id = "playerDieAnim";
    playerDieAnim.classList.add("die-animation-sprite");
    playerDieAnim.src = "images/d20_icon.png";
    playerDieAnim.alt = "Player die rolling";
    playerDieAnim.style.display = 'none';
    battleInfoDiv.appendChild(playerDieAnim);

    let enemyDieAnim = document.createElement("img");
    enemyDieAnim.id = "enemyDieAnim";
    enemyDieAnim.classList.add("die-animation-sprite");
    enemyDieAnim.src = "images/d20_icon.png";
    enemyDieAnim.alt = "Enemy die rolling";
    enemyDieAnim.style.display = 'none';
    battleInfoDiv.appendChild(enemyDieAnim);

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

    // --- ADD RESET GAME BUTTON ---
    let resetButton = document.createElement("button");
    resetButton.textContent = "Reset Game";
    resetButton.id = "resetGameButton";
    resetButton.addEventListener("click", resetToStartScreen);
    document.body.appendChild(resetButton);

    // Initial UI Updates now that all elements are in the DOM
    updatePlayerHpDisplay();
    updatePlayerBonusesDisplay();
    updateEnemyHpDisplay();
    updateDefeatCounterDisplay();

    rollButton.addEventListener("click", Roll);
    console.log(`Game interface created. Current enemy: ${currentEnemy.name}`);
}

function Roll() {
    // ... (initial setup: get elements, disable rollBtn, start dice animation) ...
    console.log("Roll() called - Animation starts.");
    const battleRollCharP = document.getElementById("battleRollChar");
    const battleRollEnemyP = document.getElementById("battleRollEnemy");
    const rollBtn = document.getElementById("Roll");
    const playerDieAnim = document.getElementById("playerDieAnim");
    const enemyDieAnim = document.getElementById("enemyDieAnim");

    if (!rollBtn || rollBtn.disabled) return;
    rollBtn.disabled = true;

    if (battleRollCharP) battleRollCharP.style.display = 'none';
    if (battleRollEnemyP) battleRollEnemyP.style.display = 'none';
    if (playerDieAnim) { playerDieAnim.style.display = 'inline-block'; playerDieAnim.classList.add('rolling'); }
    if (enemyDieAnim) { enemyDieAnim.style.display = 'inline-block'; enemyDieAnim.classList.add('rolling'); }

    const animationDuration = 1500; // Dice rolling animation

    setTimeout(() => {
        // ... (stop dice animation, hide dice, calculate rolls, display roll text) ...
        if (playerDieAnim) { playerDieAnim.classList.remove('rolling'); playerDieAnim.style.display = 'none'; }
        if (enemyDieAnim) { enemyDieAnim.classList.remove('rolling'); enemyDieAnim.style.display = 'none'; }

        let randomNumberChar = Math.floor(Math.random() * 20) + 1;
        const randomNumberEnemy = Math.floor(Math.random() * 20) + 1;
        let finalCharRoll = randomNumberChar + player.rollBonus;

        if (battleRollCharP) { battleRollCharP.textContent = `Player Roll: ${finalCharRoll}`; battleRollCharP.style.display = 'block'; }
        if (battleRollEnemyP) { battleRollEnemyP.textContent = `Enemy Roll: ${randomNumberEnemy}`; battleRollEnemyP.style.display = 'block'; }


        if (finalCharRoll > randomNumberEnemy) { // Player hits
            let baseDmg = Math.floor(Math.random() * (player.maxBaseDamage - player.minBaseDamage + 1)) + player.minBaseDamage;
            let totalDmg = baseDmg + player.damageBonus;
            
            // --- CALL HIT EFFECT FOR ENEMY ---
            const enemyDiv = document.querySelector(".enemy"); // Get the .enemy div
            showHitEffect(enemyDiv, totalDmg);
            // --- END HIT EFFECT CALL ---
            
            console.log(`Player hits ${currentEnemy.name} for ${totalDmg} damage!`);
            currentEnemy.currentHp -= totalDmg;
            if (currentEnemy.currentHp < 0) currentEnemy.currentHp = 0;
            updateEnemyHpDisplay(); // Update HP text

            if (currentEnemy.currentHp === 0) {
                // ... (victory logic) ...
                 console.log(`${currentEnemy.name} defeated!`);
                if (battleRollCharP) battleRollCharP.textContent = "";
                if (battleRollEnemyP) battleRollEnemyP.textContent = "";
                handleVictory();
            } else {
                 if (rollBtn) rollBtn.disabled = false;
            }
        } else if (randomNumberEnemy > finalCharRoll) { // Enemy hits
            let enemyDmg = Math.floor(Math.random() * (currentEnemy.maxDamage - currentEnemy.minDamage + 1)) + currentEnemy.minDamage;

            // --- CALL HIT EFFECT FOR PLAYER ---
            const characterDiv = document.querySelector(".character"); // Get the .character div
            showHitEffect(characterDiv, enemyDmg);
            // --- END HIT EFFECT CALL ---

            console.log(`${currentEnemy.name} hits player for ${enemyDmg} damage!`);
            player.currentHp -= enemyDmg;
            if (player.currentHp < 0) player.currentHp = 0;
            updatePlayerHpDisplay(); // Update HP text

            if (player.currentHp === 0) {
                // ... (defeat logic) ...
                console.log("Player defeated!");
                showDefeatSequence();
            } else {
                if (rollBtn) rollBtn.disabled = false;
            }
        } else { // Tie
            console.log("Rolls are tied!");
            if (battleRollCharP) battleRollCharP.textContent = `TIE! Rolls: ${finalCharRoll}`;
            if (battleRollEnemyP) battleRollEnemyP.textContent = `TIE! Rolls: ${randomNumberEnemy}`;
            if (rollBtn) rollBtn.disabled = false;
        }
    }, animationDuration);
}

function handleVictory() {
    const boardDiv = document.querySelector(".board");
    if (!boardDiv) return;

    const battleInfoDiv = document.getElementById("battle");
    const rollBtn = document.getElementById("Roll");
    if (rollBtn) rollBtn.disabled = true; // Ensure it's disabled
    if (battleInfoDiv) battleInfoDiv.style.display = 'none';

    if (currentEnemy.name === bossStatsTemplate.name) { // Boss defeated
        const banner = document.createElement("img");
        banner.src = "images/Victory.jpg";
        banner.alt = "JÖRMUNGANDR DEFEATED!";
        banner.id = "victoryBanner";
        banner.style.border = "5px solid gold";
        boardDiv.innerHTML = "";
        boardDiv.appendChild(banner);
        let victoryMsg = document.createElement("p");
        victoryMsg.textContent = "The World Serpent is vanquished! Your legend echoes!";
        victoryMsg.style.color = "gold"; victoryMsg.style.fontSize = "20px"; victoryMsg.style.textAlign = "center";
        boardDiv.appendChild(victoryMsg);
        let playAgainBtn = document.createElement("button");
        playAgainBtn.textContent = "Play Again?";
        playAgainBtn.id = "nextBattleBtn"; // Reuse style for consistency
        playAgainBtn.onclick = resetToStartScreen;
        boardDiv.appendChild(playAgainBtn);
        return;
    }

    // Regular enemy defeated
    if (!bossEncounteredThisRun) {
        enemiesDefeated++;
    }
    updateDefeatCounterDisplay();

    // Auto-heal from previous step
    let autoHealAmount = Math.floor(player.maxHp * 0.15);
    player.currentHp += autoHealAmount;
    if (player.currentHp > player.maxHp) player.currentHp = player.maxHp;
    console.log(`Player automatically healed for ${autoHealAmount} HP. Current HP: ${player.currentHp}`);
    updatePlayerHpDisplay();

    let chestImg = document.createElement("img");
    chestImg.src = "images/chest.jpg";
    chestImg.alt = "Click to Open Reward Chest";
    chestImg.id = "rewardChest";
    chestImg.classList.add("clickable-chest");

    const battleRollCharP = document.getElementById("battleRollChar");
    const battleRollEnemyP = document.getElementById("battleRollEnemy");
    if (battleRollCharP) battleRollCharP.textContent = "Victory! A chest appears...";
    if (battleRollEnemyP) battleRollEnemyP.textContent = "";
    
    boardDiv.appendChild(chestImg);

    chestImg.onclick = () => {
        chestImg.src = "images/openchest.jpg";
        chestImg.classList.remove("clickable-chest");
        chestImg.onclick = null;
        setTimeout(() => {
            chestImg.remove();
            if (battleInfoDiv) battleInfoDiv.style.display = 'flex';
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
            upgrade.apply(); // This should trigger relevant UI updates via its own logic
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
    const elementsToHideSelectors = [".character", ".enemy", ".board", "#defeatCounterDisplay"];
    elementsToHideSelectors.forEach(selector => {
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
    // Global script variables will reset on page reload.
    // Explicit reset here if we weren't reloading:
    // enemiesDefeated = 0;
    // bossEncounteredThisRun = false;
    // Re-initialize player object if needed, etc.
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
    
    const battleInfoDiv = document.getElementById("battle");
    if (battleInfoDiv) battleInfoDiv.style.display = 'flex'; // Make sure it's visible

    const rollBtn = document.getElementById("Roll");
    if (rollBtn) rollBtn.disabled = false;

    console.log(`Next battle ready against: ${currentEnemy.name}!`);
}

console.log("script.js processed and ready.");