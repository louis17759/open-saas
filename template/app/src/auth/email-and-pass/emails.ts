import { type GetVerificationEmailContentFn, type GetPasswordResetEmailContentFn } from 'wasp/server/auth';

export const getVerificationEmailContent: GetVerificationEmailContentFn = ({ verificationLink }) => ({
  subject: '验证您的邮箱地址 - 数据抓取服务平台',
  text: `欢迎使用数据抓取服务平台！请点击以下链接验证您的邮箱地址：${verificationLink}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333; font-size: 24px; margin-bottom: 10px;">欢迎使用数据抓取服务平台</h1>
        <p style="color: #666; font-size: 16px;">请验证您的邮箱地址以完成注册</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">感谢您注册我们的数据抓取服务！为了确保账户安全，请点击下方按钮验证您的邮箱地址：</p>
        
        <div style="text-align: center;">
          <a href="${verificationLink}" style="display: inline-block; background: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">验证邮箱地址</a>
        </div>
      </div>
      
      <div style="color: #666; font-size: 14px; line-height: 1.5;">
        <p>如果按钮无法点击，请复制以下链接到浏览器地址栏：</p>
        <p style="word-break: break-all; background: #f1f1f1; padding: 10px; border-radius: 4px;">${verificationLink}</p>
        <p>此链接将在24小时后失效。如有疑问，请联系我们的客服团队。</p>
      </div>
    </div>
  `,
});

export const getPasswordResetEmailContent: GetPasswordResetEmailContentFn = ({ passwordResetLink }) => ({
  subject: '重置您的密码 - 数据抓取服务平台',
  text: `您请求重置数据抓取服务平台的密码。请点击以下链接重置密码：${passwordResetLink}`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333; font-size: 24px; margin-bottom: 10px;">密码重置请求</h1>
        <p style="color: #666; font-size: 16px;">数据抓取服务平台</p>
      </div>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
        <p style="color: #333; font-size: 16px; margin-bottom: 20px;">我们收到了您重置密码的请求。如果这是您本人操作，请点击下方按钮重置密码：</p>
        
        <div style="text-align: center;">
          <a href="${passwordResetLink}" style="display: inline-block; background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">重置密码</a>
        </div>
      </div>
      
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
        <p style="color: #856404; font-size: 14px; margin: 0;"><strong>安全提醒：</strong>如果您没有请求重置密码，请忽略此邮件。您的密码不会被更改。</p>
      </div>
      
      <div style="color: #666; font-size: 14px; line-height: 1.5;">
        <p>如果按钮无法点击，请复制以下链接到浏览器地址栏：</p>
        <p style="word-break: break-all; background: #f1f1f1; padding: 10px; border-radius: 4px;">${passwordResetLink}</p>
        <p>此链接将在1小时后失效。如有疑问，请联系我们的客服团队。</p>
      </div>
    </div>
  `,
});
