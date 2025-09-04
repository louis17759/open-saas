import { CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'wasp/client/auth';
import { generateCheckoutSession, getCustomerPortalUrl, useQuery } from 'wasp/client/operations';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardFooter, CardTitle } from '../components/ui/card';
import { cn } from '../lib/utils';
import { PaymentPlanId, paymentPlans, prettyPaymentPlanName, SubscriptionStatus } from './plans';

const bestDealPaymentPlanId: PaymentPlanId = PaymentPlanId.Credits10000;

interface PaymentPlanCard {
  name: string;
  price: string;
  description: string;
  features: string[];
}

export const paymentPlanCards: Record<PaymentPlanId, PaymentPlanCard> = {
  [PaymentPlanId.Credits5000]: {
    name: prettyPaymentPlanName(PaymentPlanId.Credits5000),
    price: '¥50',
    description: '适合个人用户的基础套餐',
    features: ['5,000 点数', '永久有效', '基础技术支持', '每次API调用消耗1点数'],
  },
  [PaymentPlanId.Credits10000]: {
    name: prettyPaymentPlanName(PaymentPlanId.Credits10000),
    price: '¥95',
    description: '最受欢迎的标准套餐',
    features: ['10,000 点数', '永久有效', '优先技术支持', '更优惠的单价 (¥0.0095/点)'],
  },
  [PaymentPlanId.Credits20000]: {
    name: prettyPaymentPlanName(PaymentPlanId.Credits20000),
    price: '¥189',
    description: '企业推荐的高级套餐',
    features: ['20,000 点数', '永久有效', '专属技术支持', '最优惠单价 (¥0.00945/点)'],
  },
};

const PricingPage = () => {
  const [isPaymentLoading, setIsPaymentLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: user } = useAuth();
  const isUserSubscribed =
    !!user && !!user.subscriptionStatus && user.subscriptionStatus !== SubscriptionStatus.Deleted;

  const {
    data: customerPortalUrl,
    isLoading: isCustomerPortalUrlLoading,
    error: customerPortalUrlError,
  } = useQuery(getCustomerPortalUrl, { enabled: isUserSubscribed });

  const navigate = useNavigate();

  async function handleBuyNowClick(paymentPlanId: PaymentPlanId) {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setIsPaymentLoading(true);

      const checkoutResults = await generateCheckoutSession(paymentPlanId);

      if (checkoutResults?.sessionUrl) {
        window.open(checkoutResults.sessionUrl, '_self');
      } else {
        throw new Error('Error generating checkout session URL');
      }
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage('Error processing payment. Please try again later.');
      }
      setIsPaymentLoading(false); // We only set this to false here and not in the try block because we redirect to the checkout url within the same window
    }
  }

  const handleCustomerPortalClick = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (customerPortalUrlError) {
      setErrorMessage('Error fetching Customer Portal URL');
      return;
    }

    if (!customerPortalUrl) {
      setErrorMessage(`Customer Portal does not exist for user ${user.id}`);
      return;
    }

    window.open(customerPortalUrl, '_blank');
  };

  return (
    <div className='py-10 lg:mt-10'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div id='pricing' className='mx-auto max-w-4xl text-center'>
          <h2 className='mt-2 text-4xl font-bold tracking-tight text-foreground sm:text-5xl'>
            Pick your <span className='text-primary'>pricing</span>
          </h2>
        </div>
        <p className='mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-muted-foreground'>
          Choose between Stripe and LemonSqueezy as your payment provider. Just add your Product IDs! Try it
          out below with test credit card number <br />
          <span className='px-2 py-1 bg-muted rounded-md text-muted-foreground font-mono text-sm'>
            4242 4242 4242 4242 4242
          </span>
        </p>
        {errorMessage && (
          <Alert variant='destructive' className='mt-8'>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        <div className='isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 lg:gap-x-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3'>
          {Object.values(PaymentPlanId).map((planId) => (
            <Card
              key={planId}
              className={cn(
                'relative flex flex-col grow justify-between overflow-hidden transition-all duration-300 hover:shadow-lg',
                {
                  'ring-2 ring-primary !bg-transparent': planId === bestDealPaymentPlanId,
                  'ring-1 ring-border lg:my-8': planId !== bestDealPaymentPlanId,
                }
              )}
            >
              {planId === bestDealPaymentPlanId && (
                <div
                  className='absolute top-0 right-0 -z-10 w-full h-full transform-gpu blur-3xl'
                  aria-hidden='true'
                >
                  <div
                    className='absolute w-full h-full bg-gradient-to-br from-primary/40 via-primary/20 to-primary/10 opacity-30'
                    style={{
                      clipPath: 'circle(670% at 50% 50%)',
                    }}
                  />
                </div>
              )}
              <CardContent className='p-8 xl:p-10 h-full justify-between'>
                <div className='flex items-center justify-between gap-x-4'>
                  <CardTitle id={planId} className='text-foreground text-lg font-semibold leading-8'>
                    {paymentPlanCards[planId].name}
                  </CardTitle>
                </div>
                <p className='mt-4 text-sm leading-6 text-muted-foreground'>
                  {paymentPlanCards[planId].description}
                </p>
                <p className='mt-6 flex items-baseline gap-x-1'>
                  <span className='text-4xl font-bold tracking-tight text-foreground'>
                    {paymentPlanCards[planId].price}
                  </span>
                  <span className='text-sm font-semibold leading-6 text-muted-foreground'>
                    {paymentPlans[planId].effect.kind === 'subscription' && '/month'}
                  </span>
                </p>
                <ul role='list' className='mt-8 space-y-3 text-sm leading-6 text-muted-foreground'>
                  {paymentPlanCards[planId].features.map((feature) => (
                    <li key={feature} className='flex gap-x-3'>
                      <CheckCircle className='h-5 w-5 flex-none text-primary' aria-hidden='true' />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                {isUserSubscribed ? (
                  <Button
                    onClick={handleCustomerPortalClick}
                    disabled={isCustomerPortalUrlLoading}
                    aria-describedby='manage-subscription'
                    variant={planId === bestDealPaymentPlanId ? 'default' : 'outline'}
                    className='w-full'
                  >
                    Manage Subscription
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleBuyNowClick(planId)}
                    aria-describedby={planId}
                    variant={planId === bestDealPaymentPlanId ? 'default' : 'outline'}
                    className='w-full'
                    disabled={isPaymentLoading}
                  >
                    {!!user ? 'Buy plan' : 'Log in to buy plan'}
                  </Button>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
