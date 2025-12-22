export interface Particle {
  // Position
  x: number;
  y: number;
  z: number;
  
  // Initial Position (for rotation reference)
  ix: number;
  iy: number;
  iz: number;

  // Start Position (for Intro Animation)
  sx: number;
  sy: number;
  sz: number;

  // Velocity (for snow)
  vx: number;
  vy: number;

  // Appearance
  color: string; // CSS color string for Canvas
  baseColor: { r: number; g: number; b: number }; // For calculating dynamic brightness
  size: number;
  
  // Lifecycle
  life: number;
  maxLife: number;
  type: ParticleType;
}

export enum ParticleType {
  TREE_BODY = 'TREE_BODY',
  TREE_LIGHT = 'TREE_LIGHT',
  SNOW = 'SNOW'
}

export interface CanvasSize {
  width: number;
  height: number;
}