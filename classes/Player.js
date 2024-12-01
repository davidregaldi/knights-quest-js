import { addToConsole } from '../main.js';
import { gameOver } from '../main.js';
import { fightScreen } from '../main.js';

class Player {
    constructor({id = 'player1', name = 'Eidknab', y = 0, x = 0, consColor='royalblue', level = 1, xpMax = 250, xp = 0, hpMax = 100, hp = 100, gold = 20, map, entities}) {
        this.id = id
        this.name = name
        this.y = y
        this.x = x
        this.consColor = consColor
        this.level = level
        this.xpMax = 250 * level
        this.xp = xp
        this.hpMax = hpMax
        this.hp = hp
        this.gold = gold

        if (this.y === 'random' && this.x === 'random') {
            do {
                this.y = Math.floor(Math.random() * map.height)
                this.x = Math.floor(Math.random() * map.width)
            } while (map.terrainLayer[this.y][this.x] !== 'g' && map.terrainLayer[this.y][this.x] !== 'G')
        }

        map.entityLayer[this.y][this.x] = this.id

        entities[this.id] = this;
        addToConsole(`${this.id} ${this.x} ${this.y}`, consColor)
    }

    isDead() {
        if (this.hp > 0) {
            return false;
        } else {
            return true;
        }
    }

    move(newY, newX, map, entities, gameSounds) {
        if (!this.isDead()) {
            if (newY >= 0 && newY < map.height && newX >= 0 && newX < map.width) {
                // Vérifier si le joueur rencontre t0 pour tenter de sauter par-dessus
                let entityId = map.entityLayer[newY][newX]
    
                if (entityId === 't0') {
                    // Tenter de sauter par-dessus la case t0
                    const jumpY = newY + (newY - this.y)
                    const jumpX = newX + (newX - this.x)
    
                    if (jumpY >= 0 && jumpY < map.height && jumpX >= 0 && jumpX < map.width) {
                        // Mise à jour de newY et newX pour continuer avec la position après le saut
                        newY = jumpY
                        newX = jumpX
                        gameSounds['jump'].volume = 0.2;
                        gameSounds['jump'].play()
                    } 
                    else {
                        // Hors des limites après le saut
                        addToConsole('Cannot jump outside the map boundaries')
                        return;
                    }
                }
    
                // Vérifier les collisions spécifiques et actions sur la nouvelle position (après le saut potentiel)
                entityId = map.entityLayer[newY][newX]
    
                if (entityId === 'chest1') {
                    this.foundChest('smallChest')
                    gameSounds['chest'].volume = 0.2;
                    gameSounds['chest'].play()
                } 
                else if (entityId === 'chest2') {
                    this.foundChest('bigChest')
                    gameSounds['chest'].volume = 0.2;
                    gameSounds['chest'].play()
                } 
                else if (entityId === 'chest3') {
                    gameSounds['trap'].volume = 0.2;
                    gameSounds['trap'].play()
                    this.foundChest('trappedChest')
                } 
                else if (['t1', 't2', 't3'].includes(entityId)) {
                    gameSounds['wall'].volume = 0.2;
                    gameSounds['wall'].play();
                    addToConsole('Tree collision');
                    return;
                }
                else if (entityId !== '') {    
                    // Vérifier si une entité ennemie se trouve sur la position cible
                    if (entityId in entities) {
                        const enemy = entities[entityId];
                        fightScreen(this, enemy, { skipIntro: false });
                        // Vérifier si l'ennemi est toujours vivant après le combat
                        if (!enemy.isDead()) {
                            return;  // Stopper si l'ennemi est encore en vie
                        }
                    }
                }
                // Efface l'ancienne position
                map.entityLayer[this.y][this.x] = ''
    
                // Met à jour les coordonnées
                this.y = newY
                this.x = newX
    
                // Enregistre la nouvelle position
                map.entityLayer[this.y][this.x] = this.id
                gameSounds['move'].volume = 0.1;
                gameSounds['move'].play()
            }
        }
    }
    
    
    foundChest(chestType) {
        let gold
        if (chestType === 'smallChest') {
            gold = this.randomizeValue(20)
            this.gold = this.gold + gold
            addToConsole(`${this.name} found a chest! ${gold}gp`, 'gold')
            addToConsole(`ìnventory gp: ${this.gold}`)
        }
        else if (chestType === 'bigChest') {
            gold = this.randomizeValue(50)
            this.gold = this.gold + gold
            addToConsole(`${this.name} found a big chest! ${gold}gp`, 'gold')
            addToConsole(`ìnventory gp: ${this.gold}`)
        }
        else if (chestType === 'trappedChest') {
            addToConsole(`${this.name} triggered a trap !`, 'brown')
            addToConsole(`*BOOM*`, 'red')
            const damage = this.randomizeValue(25)
            this.hp = (this.hp - damage)
            addToConsole(`${this.name} take ${damage}dmg`, 'orange')
            if (this.isDead() === false) { addToConsole(`${this.hp}hp left.`) }
            else {        
                addToConsole(`${this.name} is dead...`)
                gameOver()
            }
        }
    }

    randomizeValue(randomValue) {
        return Math.floor(Math.random() * randomValue) + 1;
    }

    randomizeMinMax(minValue, maxValue) {
        return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue
    }
}

export default Player;