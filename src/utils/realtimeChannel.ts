/**
 * Utilities for Supabase Realtime channel naming.
 *
 * supabase-js (realtime-js 2.9x+) returns the existing channel when `supabase.channel(topic)`
 * is called with a topic that is still registered. `unsubscribe()` is asynchronous, so a
 * remount (including React StrictMode's double-invoked effects) or a second hook instance
 * using the same topic receives an already-subscribed channel, and adding `.on()` handlers
 * to it throws "cannot add `postgres_changes` callbacks ... after `subscribe()`".
 */

let channelSequence = 0;

/**
 * Returns a Realtime channel topic that is unique to one subscriber.
 * Use a new topic for every `supabase.channel()` call that registers its own handlers.
 *
 * @param baseTopic - Human-readable topic prefix (e.g. `"drinks_changes"`)
 * @returns The base topic with a per-page-load sequence suffix (e.g. `"drinks_changes:3"`)
 */
export function createChannelTopic(baseTopic: string): string {
  channelSequence += 1;
  return `${baseTopic}:${channelSequence}`;
}
