const World = {
    items: {
        health_potion: {
            id: "health_potion",
            name: "Health Potion",
            description: "Restores 20 HP",
            type: "consumable",
            value: 30,
            effect: { health: 20 }
        },
        dagger: {
            id: "dagger",
            name: "Iron Dagger",
            description: "Small but deadly (+3 damage)",
            type: "weapon",
            value: 50,
            damage: 3
        },
        // More items...
    },

    npcs: {
        bartender: {
            id: "bartender",
            name: "Gareth",
            portrait: "🍺",
            dialogue: {
                // Dialogue trees
            }
        },
        // More NPCs...
    },

    quests: {
        stolen_sword: {
            id: "stolen_sword",
            name: "Stolen Sword",
            description: "Recover the blacksmith's stolen sword",
            stages: ["Find clues", "Confront bandits", "Return sword"],
            reward: { gold: 50, items: ["health_potion"], reputation: 10 }
        },
        // More quests...
    },

    scenes: {
        character_creation: {
            id: "character_creation",
            text: "<h2>Create Your Hero</h2>...",
            choices: [
                {
                    text: "Warrior (+2 Strength, +1 Defense)",
                    nextScene: "name_selection",
                    effects: { class: "Warrior", strength: 2, defense: 1 }
                },
                // More classes...
            ]
        },
        // More scenes...
    }
};
