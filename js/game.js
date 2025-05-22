// Game State
const gameState = {
    player: new Player(),
    currentScene: 'character_creation',
    combat: null
};

// Initialize Game
function initGame() {
    loadScene(gameState.currentScene);
    
    // Event listeners
    document.getElementById('save-btn').addEventListener('click', saveGame);
    document.getElementById('load-btn').addEventListener('click', loadGame);
    document.getElementById('reset-btn').addEventListener('click', resetGame);
}

// Scene Management
function loadScene(sceneId) {
    const scene = World.scenes[sceneId];
    if (!scene) return errorScene();
    
    gameState.currentScene = sceneId;
    document.getElementById('story').innerHTML = scene.text;
    
    // Clear and rebuild choices
    const choicesContainer = document.getElementById('choices');
    choicesContainer.innerHTML = '';
    
    scene.choices.forEach(choice => {
        const button = document.createElement('button');
        button.className = 'choice-btn';
        button.textContent = choice.text;
        button.addEventListener('click', () => handleChoice(choice));
        choicesContainer.appendChild(button);
    });
    
    updateUI();
}

// (All other game functions from previous version)
// ...

// Start the game when page loads
window.addEventListener('DOMContentLoaded', initGame);
