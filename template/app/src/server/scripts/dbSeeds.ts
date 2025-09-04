import { type User } from 'wasp/entities';
import { faker } from '@faker-js/faker';
import type { PrismaClient } from '@prisma/client';
import { getSubscriptionPaymentPlanIds, SubscriptionStatus } from '../../payment/plans';

type MockUserData = Omit<User, 'id'>;

/**
 * This function, which we've imported in `app.db.seeds` in the `main.wasp` file,
 * seeds the database with mock users via the `wasp db seed` command.
 * For more info see: https://wasp.sh/docs/data-model/backends#seeding-the-database
 */
export async function seedMockUsers(prismaClient: PrismaClient) {
  const users = await Promise.all(generateMockUsersData(50).map((data) => prismaClient.user.create({ data })));
  
  // 为部分用户添加充值记录
  const usersWithPayments = users.slice(0, 20); // 前20个用户有充值记录
  await Promise.all(
    usersWithPayments.map((user) => 
      generateMockPaymentRecords(prismaClient, user.id)
    )
  );
}

function generateMockUsersData(numOfUsers: number): MockUserData[] {
  return faker.helpers.multiple(generateMockUserData, { count: numOfUsers });
}

function generateMockUserData(): MockUserData {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const subscriptionStatus = faker.helpers.arrayElement<SubscriptionStatus | null>([
    ...Object.values(SubscriptionStatus),
    null,
  ]);
  const now = new Date();
  const createdAt = faker.date.past({ refDate: now });
  const timePaid = faker.date.between({ from: createdAt, to: now });
  const credits = subscriptionStatus ? 0 : faker.number.int({ min: 10, max: 50 }); // 调整为10-50点数范围
  const hasUserPaidOnStripe = !!subscriptionStatus || credits > 10;
  return {
    email: faker.internet.email({ firstName, lastName }),
    username: faker.internet.userName({ firstName, lastName }),
    createdAt,
    lastLoginAt: faker.date.recent({ days: 30 }), // 最近30天内的登录时间
    isAdmin: false,
    credits,
    totalSpent: hasUserPaidOnStripe ? faker.number.float({ min: 50, max: 500, precision: 0.01 }) : 0, // 总消费金额
    subscriptionStatus,
    lemonSqueezyCustomerPortalUrl: null,
    paymentProcessorUserId: hasUserPaidOnStripe ? `cus_test_${faker.string.uuid()}` : null,
    datePaid: hasUserPaidOnStripe ? faker.date.between({ from: createdAt, to: timePaid }) : null,
    subscriptionPlan: subscriptionStatus ? faker.helpers.arrayElement(getSubscriptionPaymentPlanIds()) : null,
  };
}

/**
 * 为用户生成模拟充值记录
 */
async function generateMockPaymentRecords(prismaClient: PrismaClient, userId: string) {
  const recordCount = faker.number.int({ min: 1, max: 3 }); // 每个用户1-3条充值记录
  const paymentPlans = [
    { amount: 50, credits: 5000 },
    { amount: 95, credits: 10000 },
    { amount: 189, credits: 20000 }
  ];
  
  for (let i = 0; i < recordCount; i++) {
    const plan = faker.helpers.arrayElement(paymentPlans);
    const createdAt = faker.date.past({ years: 1 });
    const completedAt = faker.date.soon({ days: 1, refDate: createdAt });
    
    await prismaClient.paymentRecord.create({
      data: {
        userId,
        amount: plan.amount,
        credits: plan.credits,
        paymentMethod: 'stripe',
        transactionId: `pi_test_${faker.string.alphanumeric(24)}`,
        status: 'completed',
        createdAt,
        completedAt,
      }
    });
  }
}
