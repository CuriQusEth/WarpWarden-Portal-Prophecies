import { useGameStore } from '../store/gameStore';

export interface Point {
  x: number;
  y: number;
}

export type EnemyType = 'VOID_BEAST' | 'TIME_WRAITH' | 'RIFT_STALKER';
export type TowerType = 'BASIC' | 'SNIPER' | 'CHAIN';

const TOWER_SPECS = {
  BASIC: { color: '#00f0ff', range: 100, damage: 10, cooldown: 60, cost: 50 },
  SNIPER: { color: '#ffd700', range: 250, damage: 40, cooldown: 120, cost: 100 },
  CHAIN: { color: '#b026ff', range: 80, damage: 5, cooldown: 30, cost: 120 },
};

const ENEMY_SPECS = {
  VOID_BEAST: { color: '#ff4444', hp: 30, speed: 1, reward: 10 },
  TIME_WRAITH: { color: '#ff00aa', hp: 15, speed: 2, reward: 15 },
  RIFT_STALKER: { color: '#aa00ff', hp: 80, speed: 0.7, reward: 25 },
};

interface Enemy {
  id: string;
  type: EnemyType;
  pathIndex: number;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  speed: number;
}

interface Tower {
  id: string;
  type: TowerType;
  x: number;
  y: number;
  tick: number;
}

interface Particle {
  x: number;
  y: number;
  tx: number;
  ty: number;
  life: number;
  maxLife: number;
  color: string;
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private running = false;
  private path: Point[] = [];
  
  private enemies: Enemy[] = [];
  private towers: Tower[] = [];
  private particles: Particle[] = [];
  
  private waveTicks = 0;
  private spawnInterval = 120; // basic frame diff
  private enemiesToSpawn = 0;
  private waveActive = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.initPath();
  }

  private initPath() {
    const w = this.canvas.width;
    const h = this.canvas.height;
    // A simple winding path from top to bottom
    this.path = [
      { x: w * 0.2, y: -50 },
      { x: w * 0.2, y: h * 0.3 },
      { x: w * 0.8, y: h * 0.3 },
      { x: w * 0.8, y: h * 0.7 },
      { x: w * 0.5, y: h * 0.7 },
      { x: w * 0.5, y: h + 50 },
    ];
  }

  public resize(width: number, height: number) {
    this.canvas.width = width;
    this.canvas.height = height;
    this.initPath();
  }

  public placeTower(x: number, y: number, type: TowerType = 'BASIC'): boolean {
    const state = useGameStore.getState();
    const cost = TOWER_SPECS[type].cost;
    
    // Check if on path (very simple distance check)
    const onPath = this.path.some((p, i) => {
      if (i === 0) return false;
      const prev = this.path[i - 1];
      // simplified distance to line segment
      const l2 = Math.pow(p.x - prev.x, 2) + Math.pow(p.y - prev.y, 2);
      if (l2 === 0) return false;
      let t = ((x - prev.x) * (p.x - prev.x) + (y - prev.y) * (p.y - prev.y)) / l2;
      t = Math.max(0, Math.min(1, t));
      const dist = Math.hypot(x - (prev.x + t * (p.x - prev.x)), y - (prev.y + t * (p.y - prev.y)));
      return dist < 40;
    });

    if (!onPath && state.energy >= cost) {
      state.setEnergy((e: number) => e - cost);
      this.towers.push({
        id: Math.random().toString(),
        type,
        x,
        y,
        tick: 0,
      });
      
      // Spawn placement effect
      for(let i=0; i<10; i++) {
        this.addParticle(x, y, x + (Math.random() - 0.5)*50, y + (Math.random() - 0.5)*50, TOWER_SPECS[type].color);
      }
      return true;
    }
    return false;
  }

  public startWave() {
    if (this.waveActive) return;
    const wave = useGameStore.getState().wave;
    this.enemiesToSpawn = 5 + wave * 2;
    this.spawnInterval = Math.max(30, 120 - wave * 5);
    this.waveActive = true;
  }

  public start() {
    if (this.running) return;
    this.running = true;
    this.loop();
  }

  public stop() {
    this.running = false;
  }

  private addParticle(x: number, y: number, tx: number, ty: number, color: string) {
    this.particles.push({
      x, y, tx, ty, color, life: 1, maxLife: 20
    });
  }

  private update() {
    const state = useGameStore.getState();
    if (state.phase !== 'PLAYING') return;

    // Spawning logic
    if (this.waveActive) {
      this.waveTicks++;
      if (this.waveTicks >= this.spawnInterval && this.enemiesToSpawn > 0) {
        this.waveTicks = 0;
        this.enemiesToSpawn--;
        
        const typeKeys = Object.keys(ENEMY_SPECS) as EnemyType[];
        // progressively allow harder enemies
        const maxTypeIndex = Math.min(typeKeys.length - 1, Math.floor(state.wave / 3));
        const type = typeKeys[Math.floor(Math.random() * (maxTypeIndex + 1))];
        const spec = ENEMY_SPECS[type];
        
        this.enemies.push({
          id: Math.random().toString(),
          type,
          pathIndex: 0,
          x: this.path[0].x,
          y: this.path[0].y,
          hp: spec.hp * (1 + state.wave * 0.2),
          maxHp: spec.hp * (1 + state.wave * 0.2),
          speed: spec.speed,
        });
      } else if (this.enemiesToSpawn <= 0 && this.enemies.length === 0) {
        this.waveActive = false;
        state.setWave(state.wave + 1);
        state.addScore(100 * state.wave); // Wave completion bonus
      }
    }

    // Move enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const e = this.enemies[i];
      const target = this.path[e.pathIndex + 1];
      if (!target) {
        // Reached end! Take damage
        state.takeDamage(1);
        this.enemies.splice(i, 1);
        continue;
      }

      const dx = target.x - e.x;
      const dy = target.y - e.y;
      const dist = Math.hypot(dx, dy);
      
      if (dist <= e.speed) {
        e.x = target.x;
        e.y = target.y;
        e.pathIndex++;
      } else {
        e.x += (dx / dist) * e.speed;
        e.y += (dy / dist) * e.speed;
      }
    }

    // Towers attack
    for (const t of this.towers) {
      t.tick++;
      const spec = TOWER_SPECS[t.type];
      if (t.tick >= spec.cooldown) {
        // Find target
        const target = this.enemies.find(e => Math.hypot(e.x - t.x, e.y - t.y) <= spec.range);
        if (target) {
          t.tick = 0;
          target.hp -= spec.damage;
          this.addParticle(t.x, t.y, target.x, target.y, spec.color);
        }
      }
    }

    // Kill enemies
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      if (this.enemies[i].hp <= 0) {
        const reward = ENEMY_SPECS[this.enemies[i].type].reward;
        state.setEnergy((e: number) => e + reward);
        state.addScore(reward * 10);
        
        // Spawn death particles
        for(let p=0; p<5; p++) {
          this.addParticle(this.enemies[i].x, this.enemies[i].y, this.enemies[i].x + (Math.random() - 0.5)*30, this.enemies[i].y + (Math.random() - 0.5)*30, ENEMY_SPECS[this.enemies[i].type].color);
        }
        
        this.enemies.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life++;
      p.x += (p.tx - p.x) * 0.2;
      p.y += (p.ty - p.y) * 0.2;
      if (p.life >= p.maxLife || Math.hypot(p.tx - p.x, p.ty - p.y) < 2) {
        this.particles.splice(i, 1);
      }
    }
  }

  private draw() {
    const ctx = this.ctx as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw path
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.1)';
    ctx.lineWidth = 40;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let i = 0; i < this.path.length; i++) {
        if (i === 0) ctx.moveTo(this.path[i].x, this.path[i].y);
        else ctx.lineTo(this.path[i].x, this.path[i].y);
    }
    ctx.stroke();

    // Draw Towers
    for (const t of this.towers) {
      const spec = TOWER_SPECS[t.type];
      ctx.fillStyle = spec.color;
      ctx.beginPath();
      // Hexagon shape
      for(let i=0; i<6; i++) {
        const angle = i * Math.PI / 3;
        const x = t.x + Math.cos(angle) * 15;
        const y = t.y + Math.sin(angle) * 15;
        if(i===0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      
      // Range indicator (subtle)
      ctx.strokeStyle = `rgba(255,255,255,0.05)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(t.x, t.y, spec.range, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Draw Enemies
    for (const e of this.enemies) {
      const spec = ENEMY_SPECS[e.type];
      ctx.fillStyle = spec.color;
      ctx.beginPath();
      ctx.arc(e.x, e.y, 10, 0, Math.PI * 2);
      ctx.fill();

      // Health bar
      ctx.fillStyle = 'red';
      ctx.fillRect(e.x - 10, e.y - 15, 20, 3);
      ctx.fillStyle = '#0f0';
      ctx.fillRect(e.x - 10, e.y - 15, 20 * (e.hp / e.maxHp), 3);
    }

    // Draw Particles
    for (const p of this.particles) {
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 1 - (p.life / p.maxLife);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + (Math.random() - 0.5) * 10, p.y + (Math.random() - 0.5) * 10);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  private loop = () => {
    if (!this.running) return;
    this.update();
    this.draw();
    requestAnimationFrame(this.loop);
  };
}
