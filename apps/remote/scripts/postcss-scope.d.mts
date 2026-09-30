import type { PluginCreator } from "postcss";

export declare const REMOTE_SCOPE: string;
export declare function scopeSelector(selector: string): string;
export declare const scopeToRemote: PluginCreator<void>;
