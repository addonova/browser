import { scripting, tabs } from '../api/singletons.ts';
import { createInjectScript } from './inject-script.ts';

export const injectScript = createInjectScript({ scripting, tabs });
