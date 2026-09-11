import { Euler, MathUtils, Vector3, type Object3D } from "three";

import { LERP } from "./constants";

type LerpFactors = {
  position: number;
  rotation: number;
  scale: number;
  naturalRotation: number;
};

type State = {
  position: Vector3;
  rotation: Euler;
  scale: Vector3;
  naturalRotationY: number;
};

const TAU = Math.PI * 2;

/**
 * Sistema de transformación suave, portado de altitude101.
 *
 * Hay dos objetos: el grupo exterior, que recibe posición, rotación y
 * escala persiguiendo un objetivo con inercia; y el modelo interior,
 * que gira sobre su eje Y por su cuenta ("rotación natural"). Separar
 * las dos cosas es lo que permite que el modelo siga girando mientras
 * el scroll lo lleva de un anclaje a otro.
 *
 * Las rotaciones se interpolan por el camino más corto, para que ir de
 * 350° a 10° no dé la vuelta entera.
 */
export class SmoothTransform {
  private current: State;
  private target: State;
  private lerpFactors: LerpFactors = {
    ...LERP.NORMAL,
    naturalRotation: 0.1,
  };
  private naturalRotationActive = true;
  private naturalRotationSpeed = 0.25;

  constructor() {
    this.current = {
      position: new Vector3(0, 0, 0),
      rotation: new Euler(0, Math.PI / 6, 0),
      scale: new Vector3(1, 1, 1),
      naturalRotationY: 0,
    };
    this.target = {
      position: new Vector3(0, 0, 0),
      rotation: new Euler(0, Math.PI / 6, 0),
      scale: new Vector3(1, 1, 1),
      naturalRotationY: 0,
    };
  }

  setTargetPosition(x: number, y: number, z: number) {
    this.target.position.set(x, y, z);
  }

  setTargetRotation(x: number, y: number, z: number) {
    this.target.rotation.set(x, y, z);
  }

  setTargetScale(scale: number) {
    this.target.scale.setScalar(scale);
  }

  /** Fija el estado actual y el objetivo a la vez: sin transición. */
  setCurrentPosition(x: number, y: number, z: number) {
    this.current.position.set(x, y, z);
    this.target.position.set(x, y, z);
  }

  setCurrentRotation(x: number, y: number, z: number) {
    this.current.rotation.set(x, y, z);
    this.target.rotation.set(x, y, z);
  }

  setCurrentScale(scale: number) {
    this.current.scale.setScalar(scale);
    this.target.scale.setScalar(scale);
  }

  setLerpFactors(factors: Partial<LerpFactors>) {
    Object.assign(this.lerpFactors, factors);
  }

  /** Activa o apaga el giro continuo del modelo interior. */
  setNaturalRotation(active: boolean, speed = 0.25) {
    this.naturalRotationActive = active;
    this.naturalRotationSpeed = speed;
    if (active && Math.abs(this.current.naturalRotationY) > 4 * Math.PI) {
      this.current.naturalRotationY = this.normalize(this.current.naturalRotationY);
      this.target.naturalRotationY = this.normalize(this.target.naturalRotationY);
    }
  }

  setTargetNaturalRotation(y: number) {
    this.target.naturalRotationY = this.normalize(y);
  }

  getCurrentNaturalRotation() {
    return this.current.naturalRotationY;
  }

  /** Toma el giro que lleva el modelo como punto de partida. */
  captureNaturalRotation(y: number) {
    const normalized = this.normalize(y);
    this.current.naturalRotationY = normalized;
    this.target.naturalRotationY = normalized;
  }

  getCurrentPosition() {
    return this.current.position.clone();
  }

  getCurrentRotation() {
    return this.current.rotation.clone();
  }

  normalize(angle: number) {
    const wrapped = ((angle % TAU) + TAU) % TAU;
    return wrapped > Math.PI ? wrapped - TAU : wrapped;
  }

  /**
   * Un paso de simulación. `delta` en segundos; se recorta a 0.1 s para
   * que una pestaña que vuelve del fondo no dé un salto.
   */
  update(outer: Object3D, inner: Object3D | null, delta: number) {
    const dt = Math.min(delta, 0.1);
    const frames = Math.min(60 * dt, 1);

    this.current.position.lerp(
      this.target.position,
      this.lerpFactors.position * frames,
    );
    outer.position.copy(this.current.position);

    this.current.scale.copy(this.target.scale);
    this.current.scale.x = MathUtils.clamp(this.current.scale.x, 0.001, 10);
    this.current.scale.y = MathUtils.clamp(this.current.scale.y, 0.001, 10);
    this.current.scale.z = MathUtils.clamp(this.current.scale.z, 0.001, 10);
    outer.scale.copy(this.current.scale);

    const k = this.lerpFactors.rotation * frames;
    this.current.rotation.x = this.lerpAngle(
      this.current.rotation.x,
      this.target.rotation.x,
      k,
    );
    this.current.rotation.y = this.lerpAngle(
      this.current.rotation.y,
      this.target.rotation.y,
      k,
    );
    this.current.rotation.z = this.lerpAngle(
      this.current.rotation.z,
      this.target.rotation.z,
      k,
    );
    outer.rotation.copy(this.current.rotation);

    if (!inner) return;

    if (this.naturalRotationActive) {
      this.current.naturalRotationY += this.naturalRotationSpeed * dt;
      this.current.naturalRotationY = this.normalize(this.current.naturalRotationY);
    } else {
      this.current.naturalRotationY = this.lerpAngle(
        this.current.naturalRotationY,
        this.target.naturalRotationY,
        this.lerpFactors.naturalRotation * frames,
      );
    }
    inner.rotation.y = this.current.naturalRotationY;
  }

  private lerpAngle(from: number, to: number, t: number) {
    let diff = ((to % TAU) + TAU) % TAU - ((from % TAU) + TAU) % TAU;
    if (diff > Math.PI) diff -= TAU;
    else if (diff < -Math.PI) diff += TAU;
    return from + diff * t;
  }
}
