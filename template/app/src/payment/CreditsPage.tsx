import { useState } from 'react';
import { generateCheckoutSession, useAction } from 'wasp/client/operations';
import { useAuth } from 'wasp/client/auth';
import type { User } from 'wasp/entities';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
// import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { PaymentPlanId, paymentPlans, prettyPaymentPlanName } from './plans';
import { cn } from '../lib/utils';
import { Loader2, CreditCard, Zap, Star } from 'lucide-react';

interface CreditsPageProps {
  user: User;
}

export default function CreditsPage({ user }: CreditsPageProps) {
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlanId | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const generateCheckoutSessionFn = useAction(generateCheckoutSession);

  const handlePurchase = async (planId: PaymentPlanId) => {
    try {
      setIsLoading(true);
      setSelectedPlan(planId);
      
      const session = await generateCheckoutSessionFn(planId);
      
      if (session?.sessionUrl) {
        window.location.href = session.sessionUrl;
      }
    } catch (error) {
      console.error('支付失败:', error);
      alert('支付失败，请重试');
    } finally {
      setIsLoading(false);
      setSelectedPlan(null);
    }
  };

  const creditPlans = [
    {
      id: PaymentPlanId.Credits5000,
      name: prettyPaymentPlanName(PaymentPlanId.Credits5000),
      price: '¥50',
      credits: '5,000',
      description: '适合轻度使用',
      features: [
        '5,000 点数',
        '永不过期',
        '即时到账',
        '安全支付'
      ],
      popular: false,
      icon: <CreditCard className="h-6 w-6" />
    },
    {
      id: PaymentPlanId.Credits10000,
      name: prettyPaymentPlanName(PaymentPlanId.Credits10000),
      price: '¥95',
      credits: '10,000',
      description: '最受欢迎的选择',
      features: [
        '10,000 点数',
        '永不过期',
        '即时到账',
        '安全支付',
        '性价比最高'
      ],
      popular: true,
      icon: <Zap className="h-6 w-6" />
    },
    {
      id: PaymentPlanId.Credits20000,
      name: prettyPaymentPlanName(PaymentPlanId.Credits20000),
      price: '¥189',
      credits: '20,000',
      description: '适合重度使用',
      features: [
        '20,000 点数',
        '永不过期',
        '即时到账',
        '安全支付',
        '最大优惠'
      ],
      popular: false,
      icon: <Star className="h-6 w-6" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            点数充值
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            选择适合您的点数套餐，享受更多服务
          </p>
          
          {/* Current Balance */}
          <div className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg px-6 py-3 shadow-sm border">
            <CreditCard className="h-5 w-5 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-300">当前余额:</span>
            <span className="font-semibold text-lg text-blue-600">
              {user.credits?.toLocaleString() || '0'} 点数
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {creditPlans.map((plan) => {
            const isSelected = selectedPlan === plan.id;
            const isCurrentlyLoading = isLoading && isSelected;
            
            return (
              <Card 
                key={plan.id} 
                className={cn(
                  "relative transition-all duration-300 hover:shadow-lg",
                  plan.popular && "ring-2 ring-blue-500 scale-105",
                  isSelected && "ring-2 ring-blue-400"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-full text-xs font-medium text-white">
                    最受欢迎
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={cn(
                      "p-3 rounded-full",
                      plan.popular ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                    )}>
                      {plan.icon}
                    </div>
                  </div>
                  
                  <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{plan.description}</p>
                  
                  <div className="mt-4">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {plan.credits} 点数
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <Separator className="mb-6" />
                  
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={isLoading}
                    className={cn(
                      "w-full h-12 text-base font-semibold transition-all duration-200",
                      plan.popular 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "bg-gray-900 hover:bg-gray-800 text-white dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100"
                    )}
                  >
                    {isCurrentlyLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        处理中...
                      </>
                    ) : (
                      `购买 ${plan.credits} 点数`
                    )}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Security Notice */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full" />
            </div>
            <span>安全支付由 Stripe 提供保障</span>
          </div>
        </div>
      </div>
    </div>
  );
}