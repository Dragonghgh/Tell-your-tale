class Player {
    constructor() {
        this.name = "";
        this.class = "";
        this.level = 1;
        this.gold = 0;
        this.reputation = 50;
        this.health = 100;
        this.maxHealth = 100;
        this.inventory = [];
        this.equipment = {
            weapon: null,
            armor: null
        };
        this.stats = {
            strength: 5,
            agility: 5,
            intelligence: 5,
            charisma: 5,
            defense: 0
        };
        this.quests = [];
        this.flags = {};
    }

    addItem(itemId) {
        this.inventory.push(itemId);
    }

    removeItem(itemId) {
        const index = this.inventory.indexOf(itemId);
        if (index > -1) {
            this.inventory.splice(index, 1);
        }
    }

    equipItem(itemId, type) {
        if (this.equipment[type]) {
            this.inventory.push(this.equipment[type]);
        }
        this.equipment[type] = itemId;
        this.removeItem(itemId);
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        return this.health > 0;
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    addQuest(questId) {
        if (!this.quests.includes(questId)) {
            this.quests.push(questId);
            return true;
        }
        return false;
    }

    completeQuest(questId) {
        const index = this.quests.indexOf(questId);
        if (index > -1) {
            this.quests.splice(index, 1);
            return true;
        }
        return false;
    }
}
