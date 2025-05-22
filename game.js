// Game State
const gameState = {
    currentScene: 'start',
    player: {
        name: "Adventurer",
        gold: 100,
        reputation: 50,
        inventory: [],
        stats: {
            strength: 5,
            agility: 5,
            intelligence: 5,
            charisma: 5
        },
        quests: []
    },
    flags: {},
    items: {
        health_potion: {
            id: "health_potion",
            name: "Health Potion",
            description: "Restores 20 health when consumed",
            type: "consumable",
            value: 30
        },
        old_sword: {
            id: "old_sword",
            name: "Old Sword",
            description: "A simple but well-made sword",
            type: "weapon",
            value: 50,
            damage: 8
        }
    },
    scenes: {
        start: {
            id: 'start',
            text: "You awaken in the small village of Briarwood, the morning sun peeking through your window. Today is the day you begin your journey as an adventurer. What path will you take?",
            choices: [
                { text: "Visit the local tavern to seek work", nextScene: "tavern", effects: { reputation: 2 } },
                { text: "Go to the blacksmith to apprentice", nextScene: "blacksmith", effects: { reputation: -1 } },
                { text: "Head to the town square", nextScene: "town_square" }
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
                { text: "Decline politely", nextScene: "tavern", effects: { reputation: -1 } }
            ]
        },
        sword_quest: {
            id: 'sword_quest',
            text: "You've accepted the quest to retrieve Thom's sword. The bartender mentions the thieves were last seen heading toward the old mill. How will you proceed?",
            choices: [
                { text: "Go directly to the mill", nextScene: "mill_direct" },
                { text: "Buy a health potion before going (30 gold)", nextScene: "potion_shop", requires: { gold: 30 } },
                { text: "Try to recruit help", nextScene: "recruit_help", requires: { reputation: 30 } }
            ]
        },
        potion_shop: {
            id: 'potion_shop',
            text: "You visit the local alchemist and purchase a health potion for 30 gold. Now prepared, you head toward the old mill where the thieves were last seen.",
            choices: [
                { text: "Approach the mill cautiously", nextScene: "mill_cautious" },
                { text: "Burst in aggressively", nextScene: "mill_aggressive" }
            ],
            effects: { gold: -30, items: ["health_potion"] }
        }
    },
    quests: {
        sword: {
            id: "sword",
            name: "Recover Thom's Sword",
            description: "Retrieve the stolen sword from the thieves at the old mill",
            reward: { gold: 50, reputation: 10 }
        }
    }
};

// Initialize the game
function initGame() {
    updatePlayerUI();
    loadScene(gameState.currentScene);
    
    // Set up event listeners
    document.getElementById('save-btn').addEventListener('click', saveGame);
    document.getElementById('load-btn').addEventListener('click', loadGame);
}

// Load a scene
function loadScene(sceneId) {
    const scene = gameState.scenes[sceneId];
    if (!scene) {
        console.error(`Scene ${sceneId} not found!`);
        return;
    }
    
    gameState.currentScene = sceneId;
    document.getElementById('story-text').innerHTML = `<p>${scene.text}</p>`;
    
    const choicesContainer = document.getElementById('choices');
    choicesContainer.innerHTML = '';
    
    scene.choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = choice.text;
        button.addEventListener('click', () => handleChoice(choice));
        
        if (choice.requires && !meetsRequirements(choice.requires)) {
            button.disabled = true;
        }
        
        choicesContainer.appendChild(button);
    });
    
    // Apply any scene effects
    if (scene.effects) {
        applyEffects(scene.effects);
    }
}

// Handle player choice
function handleChoice(choice) {
    if (choice.effects) {
        applyEffects(choice.effects);
    }
    
    if (choice.action) {
        handleSpecialAction(choice.action);
    }
    
    if (choice.nextScene) {
        loadScene(choice.nextScene);
    }
}

// Update player UI
function updatePlayerUI() {
    document.getElementById('player-name').textContent = gameState.player.name;
    document.getElementById('player-gold').textContent = gameState.player.gold;
    document.getElementById('gold-display').textContent = `(${gameState.player.gold} gold)`;
    
    let repText;
    if (gameState.player.reputation < 20) repText = "Villified";
    else if (gameState.player.reputation < 40) repText = "Disliked";
    else if (gameState.player.reputation < 60) repText = "Neutral";
    else if (gameState.player.reputation < 80) repText = "Liked";
    else repText = "Revered";
    
    document.getElementById('player-rep').textContent = repText;
    
    updateInventoryUI();
}

// Update inventory UI
function updateInventoryUI() {
    const inventoryContainer = document.getElementById('inventory');
    inventoryContainer.innerHTML = '';
    
    gameState.player.inventory.forEach(itemId => {
        const item = gameState.items[itemId];
        if (item) {
            const itemElement = document.createElement('div');
            itemElement.className = 'inventory-item';
            itemElement.textContent = item.name;
            itemElement.title = item.description;
            inventoryContainer.appendChild(itemElement);
        }
    });
}

// Apply effects to player
function applyEffects(effects) {
    if (effects.gold) {
        gameState.player.gold += effects.gold;
    }
    if (effects.reputation) {
        gameState.player.reputation += effects.reputation;
        // Keep reputation between 0-100
        gameState.player.reputation = Math.max(0, Math.min(100, gameState.player.reputation));
    }
    if (effects.items) {
        effects.items.forEach(itemId => {
            if (!gameState.player.inventory.includes(itemId)) {
                gameState.player.inventory.push(itemId);
            }
        });
    }
    
    updatePlayerUI();
}

// Check requirements
function meetsRequirements(requirements) {
    for (const [key, value] of Object.entries(requirements)) {
        if (key === 'gold' && gameState.player.gold < value) return false;
        if (key === 'reputation' && gameState.player.reputation < value) return false;
        if (key in gameState.player.stats && gameState.player.stats[key] < value) return false;
        if (key === 'item' && !gameState.player.inventory.includes(value)) return false;
    }
    return true;
}

// Handle special actions
function handleSpecialAction(action) {
    const [actionType, actionParam] = action.split(':');
    
    switch(actionType) {
        case 'addQuest':
            if (!gameState.player.quests.includes(actionParam)) {
                gameState.player.quests.push(actionParam);
                alert(`Quest added: ${gameState.quests[actionParam].name}`);
            }
            break;
    }
}

// Save game
function saveGame() {
    localStorage.setItem('medievalQuestSave', JSON.stringify(gameState));
    alert("Game saved successfully!");
}

// Load game
function loadGame() {
    const savedGame = localStorage.getItem('medievalQuestSave');
    if (savedGame) {
        Object.assign(gameState, JSON.parse(savedGame));
        updatePlayerUI();
        loadScene(gameState.currentScene);
        alert("Game loaded successfully!");
    } else {
        alert("No saved game found!");
    }
}

// Start the game when page loads
window.addEventListener('DOMContentLoaded', initGame);
