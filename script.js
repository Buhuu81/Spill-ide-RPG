// script.js

// --- DOM Selectors for Initial Choice ---
const maleChoiceImage = document.querySelector(".male");
const femaleChoiceImage = document.querySelector(".female");

// --- Game State Variables ---
let player = {
    baseHp: 200, // User updated
    maxHp: 200,  // Will be set based on baseHp + gender bonus + class bonus
    currentHp: 200, // Will be set based on baseHp + gender bonus + class bonus
    rollBonus: 0,
    damageBonus: 0,
    minBaseDamage: 5, // User updated
    maxBaseDamage: 6, // User updated
    isFemale: false,
    spriteSrc: "",
    // NEW: Class, Level, Experience, Mana, Spells
    characterClass: "", // e.g., "Warrior", "Mage"
    level: 1,
    experience: 0,
    mana: 0,
    maxMana: 0,
    knownSpells: [],     // Array to store the IDs of all spells the player has learned
    equippedSpells: [],  // Array to store the IDs of spells currently on the action bar (max 3)
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
    { name: "Forest Wolf", spriteSrc: "images/Woolf.jpg", maxHp: 35, minDamage: 0, maxDamage: 4, xpValue: 20 },
    { name: "Enraged Chicken", spriteSrc: "images/Chicken.jpg", maxHp: 15, minDamage: 0, maxDamage: 1, xpValue: 10 },
    { name: "Wild Boar", spriteSrc: "images/Boar.jpg", maxHp: 30, minDamage: 0, maxDamage: 2, xpValue: 18 },
    { name: "Draug", spriteSrc: "images/Draug.jpg", maxHp: 45, minDamage: 2, maxDamage: 5, xpValue: 25 }
];

const bossStatsTemplate = {
    name: "Jörmungandr",
    spriteSrc: "images/Jorrmungandir.jpg",
    maxHp: 200, // User updated boss HP
    minDamage: 5, // User updated boss damage
    maxDamage: 10,
    xpValue: 100 // Boss gives more XP
};

// This object will hold the stats of the CURRENTLY active enemy
let currentEnemy = {
    name: "",
    spriteSrc: "",
    maxHp: 0,
    currentHp: 0,
    minDamage: 0,
    maxDamage: 0,
    xpValue: 0
};

let enemiesDefeated = 0;
const BOSS_DEFEAT_THRESHOLD = 20; // Or a smaller number like 2-3 for testing
let bossEncounteredThisRun = false;

let gameMode = "characterSelection"; // "characterSelection", "classSelection", "mapSelection", "battle", "upgradeSelection", "levelUp", "gameOver", "victory"

// NEW: Experience thresholds for leveling up
const LEVEL_THRESHOLDS = {
    1: 0,   // Starting level
    2: 100,
    3: 250,
    4: 450,
    5: 700,
    6: 1000 // Max level in this iteration
};

// NEW: All available spells
const allSpells = [
    // --- Basic Attacks (available to all starting at Level 1) ---
    {
        id: 'basic_strike', name: "Basic Strike", description: "A standard physical attack.", manaCost: 0, levelRequirement: 1, classSpecific: ['Warrior', 'Mage'],
        apply: function(target) {
            const baseDmg = Math.floor(Math.random() * (player.maxBaseDamage - player.minBaseDamage + 1)) + player.minBaseDamage;
            const totalDmg = baseDmg + player.damageBonus;
            target.currentHp -= totalDmg;
            console.log(`Player uses Basic Strike for ${totalDmg} damage!`);
            return { damage: totalDmg, type: 'physical', target: target };
        }
    },

    // --- Mage Spells ---
    {
        id: 'fire_bolt', name: "Fire Bolt", description: "Launches a small fiery projectile for 8-12 damage.", manaCost: 8, levelRequirement: 1, classSpecific: ['Mage'],
        apply: function(target) {
            const damage = Math.floor(Math.random() * 5) + 8; // 8-12 damage
            target.currentHp -= damage;
            console.log(`Mage casts Fire Bolt for ${damage} damage!`);
            return { damage: damage, type: 'magic', target: target };
        }
    },
    {
        id: 'frost_shard', name: "Frost Shard", description: "Hurls a shard of ice, dealing 7-10 damage and slowing enemy.", manaCost: 7, levelRequirement: 1, classSpecific: ['Mage'],
        apply: function(target) {
            const damage = Math.floor(Math.random() * 4) + 7; // 7-10 damage
            target.currentHp -= damage;
            // For now, "slowing" is just flavor. Later, you'd add status effects.
            console.log(`Mage casts Frost Shard for ${damage} damage!`);
            return { damage: damage, type: 'magic', target: target };
        }
    },
    // Mage Level 2 Spells
    {
        id: 'arcane_heal', name: "Arcane Heal", description: "Restore 25 HP to yourself.", manaCost: 15, levelRequirement: 2, classSpecific: ['Mage'],
        apply: function() {
            const healAmount = 25;
            player.currentHp += healAmount;
            if (player.currentHp > player.maxHp) player.currentHp = player.maxHp;
            console.log(`Mage casts Arcane Heal, restoring ${healAmount} HP.`);
            return { heal: healAmount, type: 'heal' };
        }
    },
    {
        id: 'scorching_ray', name: "Scorching Ray", description: "Blasts enemy with a ray, dealing 12-18 damage over 2 turns (DOT).", manaCost: 12, levelRequirement: 2, classSpecific: ['Mage'],
        apply: function(target) {
            const initialDamage = Math.floor(Math.random() * 7) + 12; // 12-18 initial damage
            target.currentHp -= initialDamage;
            console.log(`Mage casts Scorching Ray for ${initialDamage} initial damage!`);
            // To implement DOT: you'd need a status effects system on the enemy
            // For now, it's just initial damage + flavor text.
            return { damage: initialDamage, type: 'magic', target: target };
        }
    },
    {
        id: 'mana_shield', name: "Mana Shield", description: "Gain a shield that absorbs 20 damage for 1 turn.", manaCost: 10, levelRequirement: 2, classSpecific: ['Mage'],
        apply: function() {
            // For now, this is just flavor. Requires a "shield" or "temp HP" system.
            console.log("Mage casts Mana Shield! Damage absorbed next turn.");
            return { effect: 'shield', amount: 20 };
        }
    },
    // Mage Level 3 Spells
    {
        id: 'firestorm', name: "Firestorm", description: "Call down a localized firestorm for 20-30 AoE damage.", manaCost: 25, levelRequirement: 3, classSpecific: ['Mage'],
        apply: function(target) { // Assuming AoE hits current target for now
            const damage = Math.floor(Math.random() * 11) + 20; // 20-30 damage
            target.currentHp -= damage;
            console.log(`Mage casts Firestorm for ${damage} AoE damage!`);
            return { damage: damage, type: 'magic', target: target, isAoE: true };
        }
    },
    {
        id: 'blink', name: "Blink", description: "Teleport a short distance, granting 100% dodge chance for next enemy attack.", manaCost: 18, levelRequirement: 3, classSpecific: ['Mage'],
        apply: function() {
            // Requires an "evade next attack" status effect system.
            console.log("Mage blinks! Dodging next attack.");
            return { effect: 'evade' };
        }
    },
    {
        id: 'summon_familiar', name: "Summon Familiar", description: "Summon a helpful familiar to aid in combat.", manaCost: 20, levelRequirement: 3, classSpecific: ['Mage'],
        apply: function() {
            // Requires a companion/pet system.
            console.log("Mage summons a familiar!");
            return { effect: 'summon' };
        }
    },
     // Mage Level 4 Spells
     {
        id: 'chain_lightning', name: "Chain Lightning", description: "Arc lightning to enemies (25-35 damage).", manaCost: 30, levelRequirement: 4, classSpecific: ['Mage'],
        apply: function(target) {
            const damage = Math.floor(Math.random() * 11) + 25;
            target.currentHp -= damage;
            console.log(`Mage casts Chain Lightning for ${damage} damage!`);
            return { damage: damage, type: 'magic', target: target };
        }
    },
    {
        id: 'teleport', name: "Teleport", description: "Instantly escape from battle. (Only works outside boss fights)", manaCost: 40, levelRequirement: 4, classSpecific: ['Mage'],
        apply: function() {
            console.log("Mage teleports away!");
            return { effect: 'escape' };
        }
    },
    {
        id: 'ice_nova', name: "Ice Nova", description: "Freeze and damage all enemies (15-20 damage, stun).", manaCost: 28, levelRequirement: 4, classSpecific: ['Mage'],
        apply: function(target) {
            const damage = Math.floor(Math.random() * 6) + 15;
            target.currentHp -= damage;
            console.log(`Mage casts Ice Nova for ${damage} damage! Enemy frozen.`);
            return { damage: damage, type: 'magic', target: target, effect: 'stun' };
        }
    },
    // Mage Level 5 Spells
    {
        id: 'polymorph', name: "Polymorph", description: "Transform an enemy into a harmless creature for 3 turns. (Non-boss)", manaCost: 35, levelRequirement: 5, classSpecific: ['Mage'],
        apply: function(target) {
            console.log(`Mage polymorphs ${target.name}!`);
            return { effect: 'polymorph', target: target };
        }
    },
    {
        id: 'meteor_strike', name: "Meteor Strike", description: "Call down a meteor, dealing massive damage (40-55 AoE).", manaCost: 50, levelRequirement: 5, classSpecific: ['Mage'],
        apply: function(target) {
            const damage = Math.floor(Math.random() * 16) + 40;
            target.currentHp -= damage;
            console.log(`Mage casts Meteor Strike for ${damage} AoE damage!`);
            return { damage: damage, type: 'magic', target: target, isAoE: true };
        }
    },
    {
        id: 'time_warp', name: "Time Warp", description: "Gain an extra turn.", manaCost: 60, levelRequirement: 5, classSpecific: ['Mage'],
        apply: function() {
            console.log("Mage casts Time Warp! Extra turn granted.");
            return { effect: 'extra_turn' };
        }
    },
    // Mage Level 6 Spells
    {
        id: 'arcane_blast', name: "Arcane Blast", description: "Unleash pure arcane energy (50-70 damage).", manaCost: 45, levelRequirement: 6, classSpecific: ['Mage'],
        apply: function(target) {
            const damage = Math.floor(Math.random() * 21) + 50;
            target.currentHp -= damage;
            console.log(`Mage casts Arcane Blast for ${damage} damage!`);
            return { damage: damage, type: 'magic', target: target };
        }
    },
    {
        id: 'blizzard', name: "Blizzard", description: "Summon a blizzard, dealing continuous damage and slowing enemies for 3 turns.", manaCost: 55, levelRequirement: 6, classSpecific: ['Mage'],
        apply: function(target) {
            const damage = Math.floor(Math.random() * 11) + 30; // Initial damage
            target.currentHp -= damage;
            console.log(`Mage casts Blizzard for ${damage} damage!`);
            return { damage: damage, type: 'magic', target: target, effect: 'slow' };
        }
    },
    {
        id: 'master_healing_ward', name: "Master Healing Ward", description: "Place a ward that heals 20 HP per turn for 3 turns.", manaCost: 40, levelRequirement: 6, classSpecific: ['Mage'],
        apply: function() {
            console.log("Mage places a Master Healing Ward!");
            return { effect: 'healing_over_time' };
        }
    },

    // --- Warrior Spells (or 'Abilities') ---
    {
        id: 'shield_bash', name: "Shield Bash", description: "Stun target for 1 turn and deal 5-8 physical damage.", manaCost: 10, levelRequirement: 1, classSpecific: ['Warrior'],
        apply: function(target) {
            const damage = Math.floor(Math.random() * 4) + 5; // 5-8 damage
            target.currentHp -= damage;
            console.log(`Warrior uses Shield Bash for ${damage} damage! Enemy stunned.`);
            return { damage: damage, type: 'physical', target: target, effect: 'stun' };
        }
    },
    {
        id: 'cleave', name: "Cleave", description: "Swing your weapon in an arc, hitting all enemies for 6-9 damage.", manaCost: 12, levelRequirement: 1, classSpecific: ['Warrior'],
        apply: function(target) { // For now, hits current target only.
            const damage = Math.floor(Math.random() * 4) + 6; // 6-9 damage
            target.currentHp -= damage;
            console.log(`Warrior uses Cleave for ${damage} AoE damage!`);
            return { damage: damage, type: 'physical', target: target, isAoE: true };
        }
    },
    // Warrior Level 2 Spells
    {
        id: 'execute', name: "Execute", description: "Powerful strike, more effective on low HP enemies (15-25 damage).", manaCost: 15, levelRequirement: 2, classSpecific: ['Warrior'],
        apply: function(target) {
            let damage = Math.floor(Math.random() * 11) + 15; // 15-25 damage
            // Example: bonus damage if enemy below 30% HP
            if (target.currentHp / target.maxHp < 0.3) {
                damage = Math.floor(damage * 1.5); // 50% more damage
                console.log("Execute: Bonus damage on low HP target!");
            }
            target.currentHp -= damage;
            console.log(`Warrior uses Execute for ${damage} damage!`);
            return { damage: damage, type: 'physical', target: target };
        }
    },
    {
        id: 'defensive_stance', name: "Defensive Stance", description: "Reduce incoming damage by 30% for 1 turn.", manaCost: 10, levelRequirement: 2, classSpecific: ['Warrior'],
        apply: function() {
            // Requires a "damage reduction" buff system.
            console.log("Warrior enters Defensive Stance!");
            return { effect: 'damage_reduction', amount: 0.3 };
        }
    },
    {
        id: 'challenging_shout', name: "Challenging Shout", description: "Taunt enemy, forcing them to attack you and gaining 5 temporary HP.", manaCost: 8, levelRequirement: 2, classSpecific: ['Warrior'],
        apply: function() {
            // Requires taunt/aggro system and temp HP.
            player.currentHp += 5; // Temp HP for now, or actual temp HP system.
            console.log("Warrior uses Challenging Shout! +5 Temp HP.");
            return { effect: 'taunt', tempHp: 5 };
        }
    },
    // Warrior Level 3 Spells
    {
        id: 'whirlwind', name: "Whirlwind", description: "Spin, attacking all enemies for 10-15 damage.", manaCost: 20, levelRequirement: 3, classSpecific: ['Warrior'],
        apply: function(target) {
            const damage = Math.floor(Math.random() * 6) + 10; // 10-15 damage
            target.currentHp -= damage;
            console.log(`Warrior uses Whirlwind for ${damage} AoE damage!`);
            return { damage: damage, type: 'physical', target: target, isAoE: true };
        }
    },
    {
        id: 'rallying_cry', name: "Rallying Cry", description: "Heal yourself and allies for 30 HP and grant +1 damage bonus for 2 turns.", manaCost: 25, levelRequirement: 3, classSpecific: ['Warrior'],
        apply: function() {
            const healAmount = 30;
            player.currentHp += healAmount;
            if (player.currentHp > player.maxHp) player.currentHp = player.maxHp;
            player.damageBonus += 1; // Temporary bonus - requires a duration system later
            console.log(`Warrior uses Rallying Cry! +${healAmount} HP and +1 Damage.`);
            return { heal: healAmount, effect: 'buff', damageBonus: 1 };
        }
    },
    {
        id: 'charge', name: "Charge", description: "Charge at target, dealing 15-20 damage and stunning for 1 turn.", manaCost: 18, levelRequirement: 3, classSpecific: ['Warrior'],
        apply: function(target) {
            const damage = Math.floor(Math.random() * 6) + 15; // 15-20 damage
            target.currentHp -= damage;
            console.log(`Warrior uses Charge for ${damage} damage! Enemy stunned.`);
            return { damage: damage, type: 'physical', target: target, effect: 'stun' };
        }
    },
    // Warrior Level 4 Spells
    {
        id: 'last_stand', name: "Last Stand", description: "Become immune to damage for 1 turn. (Cannot use during boss fight)", manaCost: 25, levelRequirement: 4, classSpecific: ['Warrior'],
        apply: function() {
            console.log("Warrior activates Last Stand!");
            return { effect: 'invulnerable' };
        }
    },
    {
        id: 'bloodthirst', name: "Bloodthirst", description: "Attack, healing yourself for 50% of damage dealt (10-15 damage).", manaCost: 15, levelRequirement: 4, classSpecific: ['Warrior'],
        apply: function(target) {
            const damage = Math.floor(Math.random() * 6) + 10;
            target.currentHp -= damage;
            const heal = Math.floor(damage * 0.5);
            player.currentHp += heal;
            if (player.currentHp > player.maxHp) player.currentHp = player.maxHp;
            console.log(`Warrior uses Bloodthirst for ${damage} damage, healing ${heal} HP.`);
            return { damage: damage, heal: heal, type: 'physical', target: target };
        }
    },
    {
        id: 'shatter_armor', name: "Shatter Armor", description: "Deal 12-18 damage and reduce enemy's armor for 2 turns.", manaCost: 18, levelRequirement: 4, classSpecific: ['Warrior'],
        apply: function(target) {
            const damage = Math.floor(Math.random() * 7) + 12;
            target.currentHp -= damage;
            console.log(`Warrior uses Shatter Armor for ${damage} damage! Enemy armor reduced.`);
            return { damage: damage, type: 'physical', target: target, effect: 'armor_break' };
        }
    },
    // Warrior Level 5 Spells
    {
        id: 'bladestorm', name: "Bladestorm", description: "Unleash a flurry of attacks on all enemies (15-20 AoE damage per enemy).", manaCost: 35, levelRequirement: 5, classSpecific: ['Warrior'],
        apply: function(target) {
            const damage = Math.floor(Math.random() * 6) + 15;
            target.currentHp -= damage;
            console.log(`Warrior uses Bladestorm for ${damage} AoE damage!`);
            return { damage: damage, type: 'physical', target: target, isAoE: true };
        }
    },
    {
        id: 'vengeance', name: "Vengeance", description: "Counter-attack with double damage if hit next turn.", manaCost: 20, levelRequirement: 5, classSpecific: ['Warrior'],
        apply: function() {
            console.log("Warrior prepares for Vengeance!");
            return { effect: 'counter_attack' };
        }
    },
    {
        id: 'intimidating_shout', name: "Intimidating Shout", description: "Reduce enemy's damage output by 25% for 2 turns.", manaCost: 22, levelRequirement: 5, classSpecific: ['Warrior'],
        apply: function(target) {
            console.log(`Warrior uses Intimidating Shout! ${target.name} damage reduced.`);
            return { effect: 'debuff_damage', target: target };
        }
    },
    // Warrior Level 6 Spells
    {
        id: 'colossus_smash', name: "Colossus Smash", description: "Deliver a devastating blow (60-80 damage).", manaCost: 50, levelRequirement: 6, classSpecific: ['Warrior'],
        apply: function(target) {
            const damage = Math.floor(Math.random() * 21) + 60;
            target.currentHp -= damage;
            console.log(`Warrior uses Colossus Smash for ${damage} damage!`);
            return { damage: damage, type: 'physical', target: target };
        }
    },
    {
        id: 'master_tactician', name: "Master Tactician", description: "Grant all equipped spells 0 mana cost for 1 turn.", manaCost: 40, levelRequirement: 6, classSpecific: ['Warrior'],
        apply: function() {
            console.log("Warrior uses Master Tactician! Spells free next turn.");
            return { effect: 'free_spells' };
        }
    },
    {
        id: 'champion_valor', name: "Champion's Valor", description: "Heal for 50 HP and gain +2 damage bonus for 3 turns.", manaCost: 45, levelRequirement: 6, classSpecific: ['Warrior'],
        apply: function() {
            const healAmount = 50;
            player.currentHp += healAmount;
            if (player.currentHp > player.maxHp) player.currentHp = player.maxHp;
            player.damageBonus += 2;
            console.log(`Warrior uses Champion's Valor! +${healAmount} HP and +2 Damage.`);
            return { heal: healAmount, effect: 'buff', damageBonus: 2 };
        }
    }
];

// Helper to get spell object by ID
function getSpell(id) {
    return allSpells.find(s => s.id === id);
}


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
    // Gender bonuses can still apply here, or be integrated into class choice
    player.maxHp = player.baseHp + (isFemale ? 0 : 20);
    player.currentHp = player.maxHp;
    player.rollBonus = isFemale ? 1 : 0;
    player.damageBonus = 0;
    player.spriteSrc = isFemale ? "images/Female viking fight.jpg" : "images/Male viking.jpg";

    player.level = 1; // Reset level on new game
    player.experience = 0;
    player.knownSpells = [];
    player.equippedSpells = [];
    player.mana = 0;
    player.maxMana = 0;

    console.log(`${isFemale ? "Female" : "Male"} character chosen.`);
    gameMode = "classSelection";
    renderClassSelectionUI(); // NEW: Go to class selection
}

// --- NEW: Class Selection ---
function renderClassSelectionUI() {
    document.body.innerHTML = ""; // Clear current content
    document.body.style.justifyContent = 'center';

    let classSelectionContainer = document.createElement("div");
    classSelectionContainer.id = "classSelectionContainer";
    classSelectionContainer.innerHTML = `
        <h2>Choose Your Calling</h2>
        <div class="class-choice-area">
            <button class="class-choice-btn" data-class="Warrior">
                <strong>Warrior</strong><br><small>High HP, Strong Attacks, Melee</small>
            </button>
            <button class="class-choice-btn" data-class="Mage">
                <strong>Mage</strong><br><small>Lower HP, Powerful Spells, Mana</small>
            </button>
            </div>
    `;
    document.body.appendChild(classSelectionContainer);

    document.querySelectorAll(".class-choice-btn").forEach(button => {
        button.addEventListener("click", () => selectClass(button.dataset.class));
    });

    // Add reset button
    if (!document.getElementById("resetGameButton")) {
        let resetButton = document.createElement("button");
        resetButton.textContent = "Reset Game";
        resetButton.id = "resetGameButton";
        resetButton.addEventListener("click", resetToStartScreen);
        document.body.appendChild(resetButton);
    }
}

function selectClass(className) {
    player.characterClass = className;
    console.log(`Class chosen: ${className}`);

    // Apply class-specific bonuses/stats
    switch (className) {
        case "Warrior":
            player.maxHp += 50;
            player.minBaseDamage += 2;
            player.maxBaseDamage += 3;
            player.maxMana = 20; // Small mana pool for some abilities
            player.mana = player.maxMana;
            // Learn starting spells for Warrior
            player.knownSpells.push('basic_strike');
            player.knownSpells.push('shield_bash');
            player.knownSpells.push('cleave');
            // Equip starting spells (Basic Strike + two class spells)
            player.equippedSpells = ['basic_strike', 'shield_bash', 'cleave'];
            break;
        case "Mage":
            player.maxHp -= 20;
            player.minBaseDamage = 1;
            player.maxBaseDamage = 2;
            player.maxMana = 50;
            player.mana = player.maxMana;
            // Learn starting spells for Mage
            player.knownSpells.push('basic_strike');
            player.knownSpells.push('fire_bolt');
            player.knownSpells.push('frost_shard');
            // Equip starting spells
            player.equippedSpells = ['basic_strike', 'fire_bolt', 'frost_shard'];
            break;
        default:
            // Default setup if no specific class matches (shouldn't happen with buttons)
            player.maxHp += 0;
            player.maxMana = 0;
            player.mana = 0;
            player.knownSpells.push('basic_strike');
            player.equippedSpells.push('basic_strike');
            break;
    }
    player.currentHp = player.maxHp; // Fill HP based on new maxHp
    console.log(`Player stats after class selection: HP ${player.currentHp}/${player.maxHp}, Mana ${player.mana}/${player.maxMana}, Class ${player.characterClass}`);

    gameMode = "mapSelection"; // Start with map selection after class
    renderMapUI();
}

// --- UI Update Functions ---
function updatePlayerHpDisplay() {
    const hpDisplay = document.getElementById("characterHpDisplay");
    const manaDisplay = document.getElementById("characterManaDisplay");
    const levelDisplay = document.getElementById("characterLevelDisplay");
    const expBar = document.getElementById("expBarFill"); // Targeting the fill element
    const expText = document.getElementById("expText"); // Targeting the text inside the bar

    if (hpDisplay) hpDisplay.textContent = `HP: ${player.currentHp}/${player.maxHp}`;
    if (manaDisplay) manaDisplay.textContent = `Mana: ${player.mana}/${player.maxMana}`;
    if (levelDisplay) levelDisplay.textContent = `Level: ${player.level}`;

    if (expBar && expText) {
        const nextLevelExp = LEVEL_THRESHOLDS[player.level + 1];
        if (nextLevelExp !== undefined) { // Not max level
            const prevLevelExp = LEVEL_THRESHOLDS[player.level];
            const expForThisLevel = player.experience - prevLevelExp;
            const totalExpToNextLevel = nextLevelExp - prevLevelExp;
            const percentage = (expForThisLevel / totalExpToNextLevel) * 100;
            expBar.style.width = `${percentage}%`;
            expText.textContent = `XP: ${player.experience}/${nextLevelExp}`;
        } else { // Max level
            expBar.style.width = `100%`;
            expText.textContent = `XP: MAX`;
        }
    }
}

function updateEnemyHpDisplay() {
    const display = document.getElementById("enemyHpDisplay");
    if (display) {
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

function updateBattleLog(message) {
    const battleLog = document.getElementById("battleLog");
    if (battleLog) {
        battleLog.innerHTML = `<p>${message}</p>`;
    }
}

// --- Game Logic Functions ---
function loadRandomEnemy() {
    if (allEnemies.length === 0) {
        console.error("No enemies defined in allEnemies array!");
        Object.assign(currentEnemy, { name: "Lost Soul", spriteSrc: "images/default_enemy.jpg", maxHp: 50, currentHp: 50, minDamage: 1, maxDamage: 3, xpValue: 15});
        return;
    }
    const randomIndex = Math.floor(Math.random() * allEnemies.length);
    const template = allEnemies[randomIndex];
    Object.assign(currentEnemy, JSON.parse(JSON.stringify(template)), { currentHp: template.maxHp });
    console.log(`Loaded random enemy: ${currentEnemy.name}`);
}

function loadBoss() {
    Object.assign(currentEnemy, JSON.parse(JSON.stringify(bossStatsTemplate)), { currentHp: bossStatsTemplate.maxHp });
    bossEncounteredThisRun = true;
    console.log(`BOSS LOADED: ${currentEnemy.name}`);
}

function showHitEffect(targetContainerElement, amount, isHealing = false) {
    if (!targetContainerElement) {
        console.error("Target container for hit effect not found!");
        return;
    }

    // Create Hit Marker Sprite (only for damage)
    if (!isHealing) {
        const hitMarker = document.createElement("img");
        hitMarker.src = "images/hit.png"; // Ensure you have 'images/hit.png'
        hitMarker.classList.add("hit-marker-sprite");
        hitMarker.alt = "Hit!";
        targetContainerElement.appendChild(hitMarker);
    }


    // Create Damage Text
    const damageText = document.createElement("p");
    damageText.classList.add("damage-text-popup");
    if (isHealing) {
        damageText.textContent = `+${amount}`;
        damageText.classList.add("healing-text"); // Add class for green color
    } else {
        damageText.textContent = `-${amount}`;
    }

    targetContainerElement.appendChild(damageText);

    const animationCSSDuration = 700;
    setTimeout(() => {
        if (!isHealing && hitMarker && hitMarker.parentNode) { // Check hitMarker exists before removing
            hitMarker.remove();
        }
        if (damageText.parentNode) {
            damageText.remove();
        }
    }, animationCSSDuration);
}


// Refactored Start Fight into a 'Render Battle UI' function
function renderBattleUI() {
    console.log("renderBattleUI() called.");
    document.body.innerHTML = ""; // Clear previous screen content
    document.body.style.justifyContent = 'space-evenly';

    // Add Defeat Counter Display
    let defeatCounterDisplay = document.createElement("div");
    defeatCounterDisplay.id = "defeatCounterDisplay";
    document.body.prepend(defeatCounterDisplay);

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

    // NEW: Mana Display
    let characterManaDisplay = document.createElement("p");
    characterManaDisplay.id = "characterManaDisplay";
    characterManaDisplay.classList.add("mana-text"); // Add a CSS class for mana
    characterDiv.appendChild(characterManaDisplay);

    // NEW: Level Display
    let characterLevelDisplay = document.createElement("p");
    characterLevelDisplay.id = "characterLevelDisplay";
    characterLevelDisplay.classList.add("level-text"); // Add a CSS class for level
    characterDiv.appendChild(characterLevelDisplay);

    // NEW: XP Bar/Display
    let characterExpContainer = document.createElement("div");
    characterExpContainer.classList.add("exp-bar-container");
    let expBarFill = document.createElement("div");
    expBarFill.id = "expBarFill";
    expBarFill.classList.add("exp-bar-fill");
    characterExpContainer.appendChild(expBarFill);
    let expText = document.createElement("span");
    expText.id = "expText";
    expText.classList.add("exp-text");
    characterExpContainer.appendChild(expText);
    characterDiv.appendChild(characterExpContainer);


    let playerBonusesDisplay = document.createElement("p");
    playerBonusesDisplay.id = "playerBonusesDisplay";
    playerBonusesDisplay.classList.add("bonus-text");
    characterDiv.appendChild(playerBonusesDisplay);

    // --- Central Board/Battle Log Setup ---
    let boardDiv = document.createElement("div");
    boardDiv.classList.add("board");
    let battleInfoDiv = document.createElement("div");
    battleInfoDiv.id = "battle";

    // Keep enemy die animation if enemies still roll to hit
    let enemyDieAnim = document.createElement("img");
    enemyDieAnim.id = "enemyDieAnim";
    enemyDieAnim.classList.add("die-animation-sprite");
    enemyDieAnim.src = "images/d20_icon.png";
    enemyDieAnim.alt = "Enemy die rolling";
    enemyDieAnim.style.display = 'none';
    battleInfoDiv.appendChild(enemyDieAnim);

    let battleLog = document.createElement("div"); // Use a general battle log div
    battleLog.id = "battleLog";
    battleLog.innerHTML = `<p>Choose your spell...</p>`; // Initial message
    battleInfoDiv.appendChild(battleLog);
    boardDiv.appendChild(battleInfoDiv);

    // NEW: Spell Action Bar
    let spellActionBar = document.createElement("div");
    spellActionBar.id = "spellActionBar";
    player.equippedSpells.forEach(spellId => {
        const spell = getSpell(spellId);
        if (spell) {
            let spellButton = document.createElement("button");
            spellButton.id = `spellBtn_${spell.id}`;
            spellButton.classList.add("spell-button");
            spellButton.innerHTML = `<strong>${spell.name}</strong><br><small>(${spell.manaCost} Mana)</small>`;
            spellButton.onclick = () => castSpell(spell.id);
            spellButton.disabled = player.mana < spell.manaCost; // Disable if not enough mana
            spellActionBar.appendChild(spellButton);
        }
    });
    boardDiv.appendChild(spellActionBar);

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
    updateSpellButtonStates(); // Update spell button enable/disable state

    console.log(`Game interface created. Current enemy: ${currentEnemy.name}`);
}

function updateSpellButtonStates() {
    player.equippedSpells.forEach(spellId => {
        const spell = getSpell(spellId);
        const button = document.getElementById(`spellBtn_${spellId}`);
        if (button && spell) {
            button.disabled = player.mana < spell.manaCost;
            if (button.disabled) {
                button.classList.add('disabled-mana'); // Add a class for visual feedback
            } else {
                button.classList.remove('disabled-mana');
            }
        }
    });
}

// NEW: Player's action handler (replaces old Roll function)
function castSpell(spellId) {
    const spell = getSpell(spellId);
    if (!spell) {
        console.error("Spell not found:", spellId);
        return;
    }

    if (player.mana < spell.manaCost) {
        updateBattleLog("Not enough mana for " + spell.name + "!");
        return;
    }

    // Disable all spell buttons during the action
    document.querySelectorAll('.spell-button').forEach(btn => btn.disabled = true);
    document.querySelectorAll('.spell-button').forEach(btn => btn.classList.add('disabled-action'));


    player.mana -= spell.manaCost;
    updatePlayerHpDisplay(); // Update mana display

    updateBattleLog(`Player casts ${spell.name}!`);

    // Apply spell effect
    const spellResult = spell.apply(currentEnemy); // Pass target (currentEnemy)

    // Handle visual feedback and check for enemy defeat after spell effect
    if (spellResult) {
        if (spellResult.damage) {
            const enemyDiv = document.querySelector(".enemy");
            showHitEffect(enemyDiv, spellResult.damage);
            updateEnemyHpDisplay();
            if (currentEnemy.currentHp <= 0) {
                handleVictory(); // Enemy defeated
                return; // Stop further actions
            }
        }
        if (spellResult.heal) {
            const characterDiv = document.querySelector(".character");
            showHitEffect(characterDiv, spellResult.heal, true); // Pass true for healing
            updatePlayerHpDisplay();
        }
        if (spellResult.effect) {
            // Handle other effects (e.g., shield, stun, buff) - just console log for now
            console.log(`Spell effect: ${spellResult.effect}`);
            if (spellResult.effect === 'escape' && currentEnemy.name !== bossStatsTemplate.name) {
                updateBattleLog("You successfully escaped!");
                setTimeout(() => {
                    gameMode = "mapSelection";
                    renderMapUI();
                }, 1500);
                return; // Prevent enemy turn
            } else if (spellResult.effect === 'escape' && currentEnemy.name === bossStatsTemplate.name) {
                updateBattleLog("Cannot escape from a Boss fight!");
            }
        }
    }


    // After player's action, it's enemy's turn
    setTimeout(enemyTurn, 1000); // Small delay before enemy turn
}

// NEW: Enemy's turn logic (extracted from old Roll function)
function enemyTurn() {
    const battleLog = document.getElementById("battleLog");
    const enemyDieAnim = document.getElementById("enemyDieAnim");

    if (enemyDieAnim) { enemyDieAnim.style.display = 'inline-block'; enemyDieAnim.classList.add('rolling'); }
    updateBattleLog(`${currentEnemy.name} is attacking...`);

    const animationDuration = 1500; // Match CSS animation

    setTimeout(() => {
        if (enemyDieAnim) { enemyDieAnim.classList.remove('rolling'); enemyDieAnim.style.display = 'none'; }

        const randomNumberEnemy = Math.floor(Math.random() * 20) + 1; // Enemy's roll to hit
        const enemyDmg = Math.floor(Math.random() * (currentEnemy.maxDamage - currentEnemy.minDamage + 1)) + currentEnemy.minDamage;

        updateBattleLog(`${currentEnemy.name} attacks for ${enemyDmg} damage!`);
        const characterDiv = document.querySelector(".character");
        showHitEffect(characterDiv, enemyDmg); // Assuming showHitEffect can handle player damage too

        player.currentHp -= enemyDmg;
        if (player.currentHp < 0) player.currentHp = 0;
        updatePlayerHpDisplay();

        if (player.currentHp === 0) {
            updateBattleLog("You have been defeated!");
            showDefeatSequence();
        } else {
            // Re-enable player spell buttons for next turn
            updateSpellButtonStates(); // Re-evaluate mana cost
            document.querySelectorAll('.spell-button').forEach(btn => btn.classList.remove('disabled-action'));
            updateBattleLog("Choose your next action.");
        }
    }, animationDuration);
}

// Modify handleVictory to award XP and check for level up
function handleVictory() {
    const boardDiv = document.querySelector(".board");
    if (!boardDiv) return;

    // Remove spell action bar from board
    const spellActionBar = document.getElementById("spellActionBar");
    if(spellActionBar) spellActionBar.remove();

    const battleLog = document.getElementById("battleLog");
    if (battleLog) battleLog.innerHTML = ""; // Clear battle log

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

    // Regular enemy defeated - award XP
    if (!bossEncounteredThisRun) {
        enemiesDefeated++;
        const xpGained = currentEnemy.xpValue || 0; // Use xpValue from enemy
        player.experience += xpGained;
        updateBattleLog(`Victory! Gained ${xpGained} XP!`);
        console.log(`Gained ${xpGained} XP. Total XP: ${player.experience}`);
    }
    updateDefeatCounterDisplay();

    // Auto-heal after combat
    let autoHealAmount = Math.floor(player.maxHp * 0.15);
    player.currentHp += autoHealAmount;
    if (player.currentHp > player.maxHp) player.currentHp = player.maxHp;
    console.log(`Player automatically healed for ${autoHealAmount} HP. Current HP: ${player.currentHp}`);
    updatePlayerHpDisplay();

    // Check for Level Up!
    checkForLevelUp();

    // If not leveled up, go straight to map choices
    if (gameMode !== "levelUp") { // If checkForLevelUp didn't trigger a level up screen
        let victoryMsg = document.createElement("p");
        victoryMsg.textContent = "Enemy defeated! Choose your next path...";
        boardDiv.innerHTML = ""; // Clear previous
        boardDiv.appendChild(victoryMsg);
        setTimeout(() => {
            gameMode = "mapSelection";
            renderMapUI();
        }, 1500);
    }
}

// NEW: Check for Level Up
function checkForLevelUp() {
    const nextLevel = player.level + 1;
    const requiredExp = LEVEL_THRESHOLDS[nextLevel];

    if (requiredExp !== undefined && player.experience >= requiredExp) { // Check if next level exists
        levelUp();
    } else {
        updatePlayerHpDisplay(); // Update XP display if no level up
    }
}

// NEW: Level Up logic
function levelUp() {
    player.level++;
    player.maxHp += 20; // Example stat increase per level
    player.maxMana += 10; // Example mana increase per level
    player.currentHp = player.maxHp; // Fully heal on level up
    player.mana = player.maxMana; // Fully restore mana

    updateBattleLog(`CONGRATULATIONS! You reached Level ${player.level}!`);
    console.log(`Leveled up to ${player.level}!`);

    gameMode = "levelUp";
    renderLevelUpUI();
}

// NEW: Render Level Up UI
function renderLevelUpUI() {
    const boardDiv = document.querySelector(".board");
    if (!boardDiv) return;

    boardDiv.innerHTML = ""; // Clear previous content
    boardDiv.style.justifyContent = "center"; // Center level up choices

    let levelUpTitle = document.createElement("h2");
    levelUpTitle.textContent = `Level Up! Level ${player.level}`;
    levelUpTitle.style.color = "gold";
    levelUpTitle.style.marginBottom = "20px";
    boardDiv.appendChild(levelUpTitle);

    let choiceContainer = document.createElement("div");
    choiceContainer.id = "spellChoiceContainer";
    choiceContainer.style.display = "flex";
    choiceContainer.style.flexDirection = "column";
    choiceContainer.style.gap = "15px";
    boardDiv.appendChild(choiceContainer);

    // Get available spells for this level and class
    const availableNewSpells = allSpells.filter(spell =>
        spell.levelRequirement === player.level &&
        spell.classSpecific.includes(player.characterClass) &&
        !player.knownSpells.includes(spell.id) // Don't show already known spells
    );

    if (availableNewSpells.length > 0) {
        let spellChoices = [];
        // Pick 3 random choices, ensuring uniqueness
        let tempAvailable = [...availableNewSpells];
        for (let i = 0; i < 3 && tempAvailable.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * tempAvailable.length);
            spellChoices.push(tempAvailable.splice(randomIndex, 1)[0]);
        }

        let chooseSpellPrompt = document.createElement("p");
        chooseSpellPrompt.textContent = "Choose a new spell to learn:";
        chooseSpellPrompt.style.fontSize = "1.1em";
        chooseSpellPrompt.style.marginBottom = "10px";
        choiceContainer.appendChild(chooseSpellPrompt);

        spellChoices.forEach(spell => {
            let spellButton = document.createElement("button");
            spellButton.classList.add("upgrade-choice-btn"); // Reuse upgrade button style
            spellButton.innerHTML = `<strong>${spell.name}</strong><br><small>${spell.description}</small>`;
            spellButton.onclick = () => learnNewSpell(spell.id);
            choiceContainer.appendChild(spellButton);
        });
    } else {
        // If no new spells for this level/class, just a continue button
        let noSpellsMsg = document.createElement("p");
        noSpellsMsg.textContent = "No new spells available at this level for your class. Enjoy your increased power!";
        noSpellsMsg.style.fontSize = "1.1em";
        noSpellsMsg.style.marginBottom = "20px";
        boardDiv.appendChild(noSpellsMsg);

        let continueBtn = document.createElement("button");
        continueBtn.textContent = "Continue Journey";
        continueBtn.id = "continueJourneyBtn";
        continueBtn.onclick = () => {
            gameMode = "mapSelection";
            renderMapUI();
        };
        boardDiv.appendChild(continueBtn);
    }
    updatePlayerHpDisplay(); // Update stats display after level up
}

// NEW: Learn a new spell and manage equipped spells
function learnNewSpell(spellId) {
    player.knownSpells.push(spellId);
    console.log(`Learned new spell: ${getSpell(spellId).name}`);

    // If less than 3 spells, automatically equip. Otherwise, just learn for now.
    // A proper "manage spells" UI would be needed for swapping.
    if (player.equippedSpells.length < 3) {
        player.equippedSpells.push(spellId);
        updateBattleLog(`${getSpell(spellId).name} equipped!`);
    } else {
        updateBattleLog(`Learned ${getSpell(spellId).name}. (Action bar full)`);
    }

    // After learning, check if more levels are available from current XP
    checkForLevelUp(); // This will immediately show next level up screen if XP allows

    if (gameMode !== "levelUp") { // If no more level-ups are pending
        // After learning/equipping, proceed to map
        gameMode = "mapSelection";
        renderMapUI(); // Transition back to map selection
    }
}

// Map tile types
const mapTileTypes = {
    ENEMY: 'enemy',
    TRAP: 'trap',
    CHEST: 'chest',
    DEAD_END: 'deadEnd',
    BOSS: 'boss'
};

// --- NEW: Map System ---
function renderMapUI() {
    document.body.innerHTML = ""; // Clear current content
    document.body.style.justifyContent = 'space-evenly'; // Layout for game

    // Re-add static player UI elements
    let characterDiv = document.createElement("div");
    characterDiv.classList.add("character");
    characterDiv.innerHTML = `
        <img class="game-sprite" src="${player.spriteSrc}" alt="${player.isFemale ? "Female Viking Player" : "Male Viking Player"}">
        <p id="characterHpDisplay" class="hp-text"></p>
        <p id="characterManaDisplay" class="mana-text"></p>
        <p id="characterLevelDisplay" class="level-text"></p>
        <div class="exp-bar-container">
            <div id="expBarFill" class="exp-bar-fill"></div>
            <span id="expText" class="exp-text"></span>
        </div>
        <p id="playerBonusesDisplay" class="bonus-text"></p>
    `;
    document.body.appendChild(characterDiv);

    // Board for map choices
    let boardDiv = document.createElement("div");
    boardDiv.classList.add("board");
    boardDiv.style.justifyContent = "center"; // For map layout

    let mapPrompt = document.createElement("p");
    mapPrompt.textContent = "Choose your path, adventurer!";
    mapPrompt.style.fontSize = "22px";
    mapPrompt.style.fontWeight = "bold";
    mapPrompt.style.color = "gold";
    mapPrompt.style.marginBottom = "20px";
    boardDiv.appendChild(mapPrompt);

    let doorsContainer = document.createElement("div");
    doorsContainer.classList.add("doors-container");
    boardDiv.appendChild(doorsContainer);

    // Generate 3 random door choices
    const choices = generateMapChoices();
    choices.forEach(choice => {
        let doorButton = document.createElement("button");
        doorButton.classList.add("door-choice-btn");
        doorButton.textContent = `${choice.type.toUpperCase()}`; // Display choice type
        doorButton.onclick = () => resolveMapChoice(choice.type);
        doorsContainer.appendChild(doorButton);
    });

    document.body.appendChild(boardDiv);

    // Add dummy enemy div for structure, will be removed/replaced in battle
    let enemyDiv = document.createElement("div");
    enemyDiv.classList.add("enemy");
    enemyDiv.style.visibility = 'hidden'; // Hide enemy during map choice
    document.body.appendChild(enemyDiv);

    // Add reset button
    if (!document.getElementById("resetGameButton")) {
        let resetButton = document.createElement("button");
        resetButton.textContent = "Reset Game";
        resetButton.id = "resetGameButton";
        resetButton.addEventListener("click", resetToStartScreen);
        document.body.appendChild(resetButton);
    }
    updatePlayerHpDisplay(); // Update all player stats including XP bar on map screen
    updatePlayerBonusesDisplay();
    updateDefeatCounterDisplay(); // Keep defeat counter visible
}

function generateMapChoices() {
    const choiceTypes = [mapTileTypes.ENEMY, mapTileTypes.TRAP, mapTileTypes.CHEST];
    let choices = [];

    let availableChoices = [...choiceTypes];
    // Add a boss option if conditions met
    if (enemiesDefeated >= BOSS_DEFEAT_THRESHOLD && !bossEncounteredThisRun) {
        availableChoices.push(mapTileTypes.BOSS);
    }
    // Add dead end for alternate paths (more likely if not boss eligible)
    availableChoices.push(mapTileTypes.DEAD_END);


    for (let i = 0; i < 3; i++) {
        let randomIndex = Math.floor(Math.random() * availableChoices.length);
        choices.push({ type: availableChoices[randomIndex] });
        // Optional: remove choice to prevent duplicates or balance
        // availableChoices.splice(randomIndex, 1);
    }
    return choices;
}

function resolveMapChoice(choiceType) {
    console.log(`Player chose: ${choiceType}`);
    const boardDiv = document.querySelector(".board");
    if (boardDiv) boardDiv.innerHTML = ""; // Clear doors

    switch (choiceType) {
        case mapTileTypes.ENEMY:
            gameMode = "battle";
            loadRandomEnemy(); // Load enemy first
            renderBattleUI(); // Then render battle UI
            break;
        case mapTileTypes.TRAP:
            const trapDamage = Math.floor(Math.random() * 10) + 5; // 5-14 damage
            player.currentHp -= trapDamage;
            if (player.currentHp < 0) player.currentHp = 0;
            console.log(`You fell into a trap! Took ${trapDamage} damage.`);
            updatePlayerHpDisplay();
            // Display a message, then transition back to map choices or to game over if dead
            if (player.currentHp === 0) {
                showDefeatSequence();
            } else {
                let trapMessage = document.createElement("p");
                trapMessage.textContent = `A trap! You took ${trapDamage} damage.`;
                trapMessage.style.color = "red"; trapMessage.style.fontSize = "18px";
                boardDiv.appendChild(trapMessage);
                setTimeout(() => {
                    gameMode = "mapSelection";
                    renderMapUI();
                }, 2000); // Wait a bit to show message
            }
            break;
        case mapTileTypes.CHEST:
            let chestMessage = document.createElement("p");
            chestMessage.textContent = "You found a chest!";
            chestMessage.style.color = "gold"; chestMessage.style.fontSize = "18px";
            boardDiv.appendChild(chestMessage);
            setTimeout(() => {
                 presentUpgradeChoices(); // Reuse existing upgrade logic
            }, 1000); // Wait a bit
            break;
        case mapTileTypes.DEAD_END:
            let deadEndMessage = document.createElement("p");
            deadEndMessage.textContent = "A dead end! You must turn back.";
            deadEndMessage.style.color = "gray"; deadEndMessage.style.fontSize = "18px";
            boardDiv.appendChild(deadEndMessage);
            // Optionally, lose some HP for backtracking
            player.currentHp -= 5; // Small penalty
            if (player.currentHp < 0) player.currentHp = 0;
            updatePlayerHpDisplay();
            setTimeout(() => {
                gameMode = "mapSelection";
                renderMapUI();
            }, 2000);
            break;
        case mapTileTypes.BOSS:
            gameMode = "battle";
            loadBoss(); // Loads the boss stats into currentEnemy
            renderBattleUI(); // Then render battle UI
            break;
    }
}


function presentUpgradeChoices() {
    const boardDiv = document.querySelector(".board");
    if (!boardDiv) return;

    boardDiv.innerHTML = ""; // Clear previous messages
    const battleLog = document.getElementById("battleLog");
    if (battleLog) battleLog.textContent = "Choose your boon!";

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
            let continueBtn = document.createElement("button");
            continueBtn.textContent = "Continue Journey";
            continueBtn.id = "continueJourneyBtn";
            continueBtn.addEventListener("click", () => {
                gameMode = "mapSelection";
                renderMapUI(); // After upgrade, go back to map
            });
            boardDiv.appendChild(continueBtn);
        };
        upgradeChoicesContainer.appendChild(upgradeButton);
    });
    boardDiv.appendChild(upgradeChoicesContainer);
}

function showDefeatSequence() {
    console.log("Showing defeat sequence...");
    const elementsToHideSelectors = [".character", ".enemy", ".board", "#defeatCounterDisplay", "#resetGameButton"]; // Hide reset button during defeat animation
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

    setTimeout(resetToStartScreen, 5000); // Shorter timeout for faster testing
}

function resetToStartScreen() {
    console.log("Resetting to start screen...");
    window.location.reload();
}

console.log("script.js processed and ready.");