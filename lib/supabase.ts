import * as SecureStore from "expo-secure-store";
import { createClient } from "@supabase/supabase-js";
import { getConfigIssues, getRuntimeConfig } from "./runtimeConfig";

const runtimeConfig = getRuntimeConfig();
const supabaseUrl = runtimeConfig.supabaseUrl;
const supabaseAnonKey = runtimeConfig.supabaseAnonKey;
const configIssues = getConfigIssues();

if (configIssues.length > 0) {
  console.warn("[RuntimeConfig] Issues detected:", configIssues.join(" | "));
}

function nonEmptyOrFallback(value: string, fallback: string) {
  return value.trim().length > 0 ? value : fallback;
}

const inMemoryStore = new Map<string, string>();
let hasSecureStoreApi = false;
try {
  hasSecureStoreApi =
    typeof SecureStore.getItemAsync === "function" &&
    typeof SecureStore.setItemAsync === "function" &&
    typeof SecureStore.deleteItemAsync === "function";
} catch {
  hasSecureStoreApi = false;
}

function getLocalStorage() {
  try {
    if (typeof globalThis.localStorage !== "undefined") {
      return globalThis.localStorage;
    }
  } catch {
    // Access can fail in restricted environments.
  }
  return null;
}

const storageAdapter = {
  getItem: async (key: string) => {
    if (hasSecureStoreApi) {
      try {
        return await SecureStore.getItemAsync(key);
      } catch {
        // Fall through to non-native storage.
      }
    }
    const localStorage = getLocalStorage();
    if (localStorage) return localStorage.getItem(key);
    return inMemoryStore.get(key) ?? null;
  },
  setItem: async (key: string, value: string) => {
    if (hasSecureStoreApi) {
      try {
        await SecureStore.setItemAsync(key, value);
        return;
      } catch {
        // Fall through to non-native storage.
      }
    }
    const localStorage = getLocalStorage();
    if (localStorage) {
      localStorage.setItem(key, value);
      return;
    }
    inMemoryStore.set(key, value);
  },
  removeItem: async (key: string) => {
    if (hasSecureStoreApi) {
      try {
        await SecureStore.deleteItemAsync(key);
        return;
      } catch {
        // Fall through to non-native storage.
      }
    }
    const localStorage = getLocalStorage();
    if (localStorage) {
      localStorage.removeItem(key);
      return;
    }
    inMemoryStore.delete(key);
  },
};

export const supabase = createClient(
  nonEmptyOrFallback(supabaseUrl, "https://example.supabase.co"),
  nonEmptyOrFallback(supabaseAnonKey, "public-anon-key-placeholder"),
  {
    auth: {
      storage: storageAdapter,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
