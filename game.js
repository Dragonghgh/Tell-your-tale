// Game State
const gameState = {
    currentScene: 'start',
    player: null,
    world: null,
    flags: {}
};

// Initialize Game
function initGame() {
    gameState.player = new Player("Adventurer");
    gameState.world = new World();
    
    // Load starting scene
    loadScene('start');
    
    // Setup UI event listeners
    document.getElementById('save-btn').addEventListener('click', saveGame);
    document.getElementById('load-btn').addEventListener('click', loadGame);
}

// Scene Management
function loadScene(sceneId) {
    const scene = gameState.world.scenes[sceneId];
    if (!scene) {
        console.error(`Scene ${sceneId} not found!`);
        return;
    }
    
    gameState.currentScene = sceneId;
    
    // Display scene text
    document.getElementById('story-text').innerHTML = `<p>${scene.text}</p>`;
    
    // Clear previous choices
    const choicesContainer = document.getElementById('choices');
    choicesContainer.innerHTML = '';
    
    // Add new choices
    scene.choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = choice.text;
        button.addEventListener('click', () => handleChoice(choice));
        
        // Disable if requirements not met
        if (choice.requires && !meetsRequirements(choice.requires)) {
            button.disabled = true;
            button.title = getRequirementText(choice.requires);
        }
        
        choicesContainer.appendChild(button);
    });
    
    // Update inventory display
    updateInventoryUI();
}

function handleChoice(choice) {
    // Execute any immediate effects
    if (choice.effects) {
        applyEffects(choice.effects);
    }
    
    // Move to next scene
    if (choice.nextScene) {
        loadScene(choice.nextScene);
    }
    
    // Handle special actions
    if (choice.action) {
        handleSpecialAction(choice.action);
    }
}

// Player Class (player.js)
class Player {
    constructor(name) {
        this.name = name;
        this.gold = 100;
        this.reputation = 50; // 0-100 scale
        this.inventory = [];
        this.relationships = {};
        this.stats = {
            strength: 5,
            agility: 5,
            intelligence: 5,
            charisma: 5
        };
        this.profession = null;
        this.quests = [];
    }
    
    addItem(item) {
        this.inventory.push(item);
        updateInventoryUI();
    }
    
    removeItem(itemId) {
        this.inventory = this.inventory.filter(item => item.id !== itemId);
        updateInventoryUI();
    }
    
    hasItem(itemId) {
        return this.inventory.some(item => item.id === itemId);
    }
    
    updateReputation(change) {
        this.reputation = Math.max(0, Math.min(100, this.reputation + change));
        updatePlayerUI();
    }
    
    addQuest(quest) {
        this.quests.push(quest);
    }
    
    completeQuest(questId) {
        const quest = this.quests.find(q => q.id === questId);
        if (quest) {
            if (quest.reward) applyEffects(quest.reward);
            this.quests = this.quests.filter(q => q.id !== questId);
        }
    }
}

// World Class (world.js)
class World {
    constructor() {
        this.scenes = {
            start: {
                id: 'start',
                text: "You awaken in the small village of Briarwood, the morning sun peeking through your window. Today is the day you begin your journey as an adventurer. What path will you take?",
                choices: [
                    { text: "Visit the local tavern to seek work", nextScene: "tavern", effects: { reputation: 2 } },
                    { text: "Go to the blacksmith to apprentice", nextScene: "blacksmith", effects: { reputation: -1 } },
                    { text: "Head to the town square", nextScene: "town_square" },
                    { text: "Visit the mysterious old hermit", nextScene: "hermit", requires: { reputation: 60 } }
                ]
            },
            tavern: {
                id: 'tavern',
                text: "The Rusty Tankard tavern is bustling with activity. The smell of ale and roasted meat fills the air. Several people seem to be looking for help with various tasks.",
                choices: [
                    { text: "Talk to the bartender", nextScene: "bartender" },
                    { text: "Approach the group of mercenaries", nextScene: "mercenaries", requires: { strength: 7 } },
                    { text: "Listen to the bard's tales", nextScene: "bard", effects: { intelligence: 1 } },
                    { text: "Leave the tavern", nextScene: "start" }
                ]
            },
            bartender: {
                id: 'bartender',
                text: "The bartender wipes a glass as you approach. 'Looking for work, eh? Old Thom had his sword stolen last night by some ruffians. Bring it back and there's 50 gold in it for you.'",
                choices: [
                    { text: "Accept the quest", nextScene: "sword_quest", action: "addQuest:sword" },
                    { text: "Ask for more information", nextScene: "sword_info" },
                    { text: "Decline politely", nextScene: "tavern", effects: { reputation: -1 } },
                    { text: "Laugh and walk away", nextScene: "tavern", effects: { reputation: -5 } }
                ]
            },
            sword_quest: {
                id: 'sword_quest',
                text: "You've accepted the quest to retrieve Thom's sword. The bartender mentions the thieves were last seen heading toward the old mill. How will you proceed?",
                choices: [
                    { text: "Go directly to the mill", nextScene: "mill_direct" },
                    { text: "Ask around town for information first", nextScene: "ask_town", requires: { charisma: 6 } },
                    { text: "Buy a health potion before going", nextScene: "potion_shop", requires: { gold: 30 } },
                    { text: "Try to recruit help", nextScene: "recruit_help", requires: { reputation: 30 } }
                ]
            }
            // More scenes would continue here...
        };
        
        this.items = {
            health_potion: {
                id: "health_potion",
                name: "Health Potion",
                description: "Restores 20 health when consumed",
                type: "consumable",
                value: 30,
                use: function() { /* healing logic */ }
            },
            old_sword: {
                id: "old_sword",
                name: "Old Sword",
                description: "A simple but well-made sword",
                type: "weapon",
                value: 50,
                damage: 8
            }
            // More items...
        };
        
        this.quests = {
            sword: {
                id: "sword",
                name: "Recover Thom's Sword",
                description: "Retrieve the stolen sword from the thieves at the old mill",
                reward: { gold: 50, reputation: 10, items: ["health_potion"] },
                stages: {
                    start: "Find the thieves' hideout",
                    middle: "Confront the thieves",
                    end: "Return the sword"
                }
            }
            // More quests...
        };
        
        this.npcs = {
            bartender: {
                id: "bartender",
                name: "Gareth",
                description: "The gruff but kind bartender of the Rusty Tankard",
                initialRelationship: 30,
                quests: ["sword"]
            }
            // More NPCs...
        };
    }
}

// UI Functions (ui.js)
function updatePlayerUI() {
    document.getElementById('player-name').textContent = gameState.player.name;
    document.getElementById('player-gold').textContent = `${gameState.player.gold} gold`;
    
    let repText;
    if (gameState.player.reputation < 20) repText = "Villified";
    else if (gameState.player.reputation < 40) repText = "Disliked";
    else if (gameState.player.reputation < 60) repText = "Neutral";
    else if (gameState.player.reputation < 80) repText = "Liked";
    else repText = "Revered";
    
    document.getElementById('player-rep').textContent = repText;
}

function updateInventoryUI() {
    const inventoryContainer = document.getElementById('inventory');
    inventoryContainer.innerHTML = '';
    
    gameState.player.inventory.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        itemElement.textContent = item.name;
        itemElement.title = item.description;
        itemElement.addEventListener('click', () => useItem(item.id));
        inventoryContainer.appendChild(itemElement);
    });
}

function useItem(itemId) {
    const item = gameState.world.items[itemId];
    if (item && item.use) {
        item.use();
    }
}

function saveGame() {
    const saveData = {
        player: gameState.player,
        currentScene: gameState.currentScene,
        flags: gameState.flags
    };
    
    localStorage.setItem('medievalQuestSave', JSON.stringify(saveData));
    alert("Game saved successfully!");
}

function loadGame() {
    const saveData = localStorage.getItem('medievalQuestSave');
    if (saveData) {
        const parsed = JSON.parse(saveData);
        gameState.player = Object.assign(new Player(), parsed.player);
        gameState.currentScene = parsed.currentScene;
        gameState.flags = parsed.flags || {};
        
        loadScene(gameState.currentScene);
        alert("Game loaded successfully!");
    } else {
        alert("No save game found!");
    }
}

// Helper Functions
function applyEffects(effects) {
    if (effects.gold) gameState.player.gold += effects.gold;
    if (effects.reputation) gameState.player.updateReputation(effects.reputation);
    if (effects.items) {
        effects.items.forEach(itemId => {
            gameState.player.addItem(gameState.world.items[itemId]);
        });
    }
    // Can add more effect types as needed
    
    updatePlayerUI();
}

function meetsRequirements(requirements) {
    for (const [key, value] of Object.entries(requirements)) {
        if (key === 'reputation' && gameState.player.reputation < value) return false;
        if (key === 'gold' && gameState.player.gold < value) return false;
        if (key in gameState.player.stats && gameState.player.stats[key] < value) return false;
        if (key === 'item' && !gameState.player.hasItem(value)) return false;
    }
    return true;
}

function getRequirementText(requirements) {
    const texts = [];
    for (const [key, value] of Object.entries(requirements)) {
        if (key === 'reputation') texts.push(`Requires ${value} reputation`);
        if (key === 'gold') texts.push(`Requires ${value} gold`);
        if (key in gameState.player.stats) texts.push(`Requires ${value} ${key}`);
        if (key === 'item') texts.push(`Requires ${value}`);
    }
    return texts.join(', ');
}

function handleSpecialAction(action) {
    const [actionType, actionParam] = action.split(':');
    
    switch(actionType) {
        case 'addQuest':
            gameState.player.addQuest(gameState.world.quests[actionParam]);
            break;
        // Can add more action types as needed
    }
}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', initGame);
