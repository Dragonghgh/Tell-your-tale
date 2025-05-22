class CombatSystem {
    static initiateCombat(player, enemy) {
        return {
            player,
            enemy,
            turn: 0,
            log: [`A ${enemy.name} appears!`],
            
            playerAttack() {
                const damage = Math.max(1, 
                    player.stats.strength + 
                    (player.equipment.weapon ? World.items[player.equipment.weapon].damage : 0) - 
                    enemy.defense
                );
                enemy.health -= damage;
                this.log.push(`You hit the ${enemy.name} for ${damage} damage!`);
                
                if (enemy.health <= 0) {
                    this.log.push(`You defeated the ${enemy.name}!`);
                    return 'player_win';
                }
                return 'enemy_turn';
            },
            
            enemyAttack() {
                const damage = Math.max(1, enemy.attack - player.stats.defense);
                player.health -= damage;
                this.log.push(`The ${enemy.name} hits you for ${damage} damage!`);
                
                if (player.health <= 0) {
                    this.log.push(`You were defeated by the ${enemy.name}!`);
                    return 'enemy_win';
                }
                return 'player_turn';
            }
        };
    }
}
