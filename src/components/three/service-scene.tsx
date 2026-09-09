"use client";

import type { RefObject } from "react";

import { SceneFrame } from "./scene-frame";
import {
  AiScene,
  AutomationScene,
  ChatScene,
  SceneLights,
  SoftwareScene,
  WebScene,
} from "./service-scenes";
import { ScenePlaceholder } from "./lazy";
import type { ServiceId } from "@/lib/services";

const SCENES = {
  web: WebScene,
  automation: AutomationScene,
  software: SoftwareScene,
  whatsapp: ChatScene,
  ai: AiScene,
} as const;

/**
 * El modelo de un servicio, con su canvas. En un módulo aparte para que
 * next/dynamic lo saque del bundle inicial.
 *
 * El canvas es decorativo: todo lo que dice el modelo ya está escrito en
 * el texto de al lado, así que no se anuncia a lectores de pantalla.
 */
export function ServiceScene({
  id,
  cameraZ,
  progress,
}: {
  id: ServiceId;
  cameraZ: number;
  progress: RefObject<number>;
}) {
  const Scene = SCENES[id];

  return (
    <SceneFrame
      className="h-full w-full"
      cameraZ={cameraZ}
      fallback={<ScenePlaceholder />}
    >
      <SceneLights />
      <Scene progress={progress} />
    </SceneFrame>
  );
}
