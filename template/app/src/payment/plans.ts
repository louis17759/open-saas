import { requireNodeEnvVar } from '../server/utils';

export enum SubscriptionStatus {
  PastDue = 'past_due',
  CancelAtPeriodEnd = 'cancel_at_period_end',
  Active = 'active',
  Deleted = 'deleted',
}

export enum PaymentPlanId {
  Credits5000 = 'credits5000',
  Credits10000 = 'credits10000', 
  Credits20000 = 'credits20000',
}

export interface PaymentPlan {
  // Returns the id under which this payment plan is identified on your payment processor.
  // E.g. this might be price id on Stripe, or variant id on LemonSqueezy.
  getPaymentProcessorPlanId: () => string;
  effect: PaymentPlanEffect;
}

export type PaymentPlanEffect = { kind: 'subscription' } | { kind: 'credits'; amount: number };

export const paymentPlans: Record<PaymentPlanId, PaymentPlan> = {
  [PaymentPlanId.Credits5000]: {
    getPaymentProcessorPlanId: () => requireNodeEnvVar('PAYMENTS_CREDITS_5000_PLAN_ID'),
    effect: { kind: 'credits', amount: 5000 },
  },
  [PaymentPlanId.Credits10000]: {
    getPaymentProcessorPlanId: () => requireNodeEnvVar('PAYMENTS_CREDITS_10000_PLAN_ID'),
    effect: { kind: 'credits', amount: 10000 },
  },
  [PaymentPlanId.Credits20000]: {
    getPaymentProcessorPlanId: () => requireNodeEnvVar('PAYMENTS_CREDITS_20000_PLAN_ID'),
    effect: { kind: 'credits', amount: 20000 },
  },
};

export function prettyPaymentPlanName(planId: PaymentPlanId): string {
  const planToName: Record<PaymentPlanId, string> = {
    [PaymentPlanId.Credits5000]: '基础套餐',
    [PaymentPlanId.Credits10000]: '标准套餐',
    [PaymentPlanId.Credits20000]: '高级套餐',
  };
  return planToName[planId];
}

export function parsePaymentPlanId(planId: string): PaymentPlanId {
  if ((Object.values(PaymentPlanId) as string[]).includes(planId)) {
    return planId as PaymentPlanId;
  } else {
    throw new Error(`Invalid PaymentPlanId: ${planId}`);
  }
}

export function getSubscriptionPaymentPlanIds(): PaymentPlanId[] {
  return Object.values(PaymentPlanId).filter((planId) => paymentPlans[planId].effect.kind === 'subscription');
}
