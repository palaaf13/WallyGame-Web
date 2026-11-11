# WallyGame Web

A browser-based maze adventure game built with **TypeScript, Phaser 4, and Vite**. Guide Wally through challenging mazes, collect bones and keys, avoid enemies, and take on a final boss encounter.

**[Play WallyGame Web](https://palaaf13.github.io/WallyGame-Web/)**

## 📖 About the Project

WallyGame Web is a web adaptation of the WallyGame project. Players control Wally, a dog navigating through maze environments filled with collectibles, obstacles, and enemies.

The game features multiple levels with increasing difficulty, requiring players to collect specific items and avoid enemies to progress.

## Features

- **Maze Exploration:** Navigate through custom-designed maze levels.
- **Player Movement:** Control Wally using keyboard arrow keys.
- **Collectibles:** Gather bones to unlock level exits and collect keys to complete the boss level.
- **Enemy AI:** Enemies patrol designated areas and attempt to catch the player.
- **Boss Encounter:** Face a boss enemy with multiple movement patterns and fireball projectiles.
- **Collision Detection:** Arcade physics handles interactions between the player, walls, collectibles, and enemies.
- **Level Progression:** Advance through levels by meeting collection requirements.
- **Game Over System:** Includes lose conditions, animations, and level restarts.

## Technologies Used

| Technology | Purpose |
|---|---|
| TypeScript | Game logic and development |
| Phaser 4 | 2D game engine and physics |
| Vite | Development server and build tool |
| Tiled | Maze and level map design |
| HTML5 / CSS3 | Web integration |
| Git / GitHub | Version control and project hosting |
| GitHub Pages | Deployment and hosting |

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/palaaf13/WallyGame-Web.git
   ```

2. Navigate into the project directory:

   ```bash
   cd WallyGame-Web
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:

   ```bash
   npm run dev
   ```

5. Open the local URL provided by Vite in your browser.

## Controls

| Key | Action |
|---|---|
| ↑ | Move Up |
| ↓ | Move Down |
| ← | Move Left |
| → | Move Right |

## Gameplay

### Level 1
Explore the first maze and collect at least 3 bones to unlock the exit.

### Level 2
Navigate a more challenging maze, collect at least 9 bones, and avoid patrolling enemies to reach the boss entrance.

### Level 3 – Boss Encounter
Face the boss enemy, avoid its fireball attacks, and collect the key to complete the game.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the local development server |
| `npm run build` | Run TypeScript checks and build the production application |
| `npm run preview` | Preview the production build locally |

## Deployment

The game is deployed using **GitHub Pages**.

Live Version: https://palaaf13.github.io/WallyGame-Web/

The Vite configuration uses `/WallyGame-Web/` as its base path to support deployment under the repository's GitHub Pages URL.

## Developer

Developed by **Axel Palacios**.

GitHub: [@palaaf13](https://github.com/palaaf13)

Repository: [WallyGame-Web](https://github.com/palaaf13/WallyGame-Web)

---

*WallyGame Web is an ongoing project focused on browser-based game development, interactive gameplay, and TypeScript application development.*
