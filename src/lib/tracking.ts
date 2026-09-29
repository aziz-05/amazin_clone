import type { Order, OrderItem } from './types';

// Demo clock: one delivery day passes every minute, so tracking visibly moves
// while someone is looking at the project. The UI labels this clearly.
export const DEMO_MS_PER_DAY = 60_000;
const REAL_MS_PER_DAY = 86_400_000;

export const STAGES = ['Ordered', 'Shipped', 'Out for delivery', 'Delivered'] as const;
export type Stage = (typeof STAGES)[number];

export function itemProgress(order: Order, item: OrderItem, now = Date.now()) {
  const placed = new Date(order.placedAt).getTime();
  const totalDays = Math.max(1, (new Date(item.estimatedDelivery).getTime() - placed) / REAL_MS_PER_DAY);
  const elapsedDays = (now - placed) / DEMO_MS_PER_DAY;
  const progress = Math.min(1, elapsedDays / totalDays);
  const stageIndex = progress >= 1 ? 3 : progress >= 0.75 ? 2 : progress >= 0.25 ? 1 : 0;
  const deliveredAt = placed + totalDays * DEMO_MS_PER_DAY;
  return { progress, stage: STAGES[stageIndex], stageIndex, msRemaining: Math.max(0, deliveredAt - now) };
}
