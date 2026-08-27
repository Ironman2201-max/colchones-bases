// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
// IMPORTANTE: Debe importar zone.js
import 'zone.js';  // ← ESTA LÍNEA DEBE ESTAR
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));