import { z } from 'zod';

type RawEnv = {
  // NEXT_PUBLIC_BASE_URL: string | undefined;
  MICROCMS_SERVICE_DOMAIN: string | undefined;
  MICROCMS_API_KEY: string | undefined;
  // REVALIDATE_SECRET: string | undefined;
  // RESEND_API_KEY: string | undefined;
  // CONTACT_TO: string | undefined;
  // TURNSTILE_SECRET_KEY: string | undefined;
};

const EnvSchema = z.object({
  // NEXT_PUBLIC_BASE_URL: z
  //   .string({ required_error: 'NEXT_PUBLIC_BASE_URL is required' })
  //   .url('NEXT_PUBLIC_BASE_URL must be a valid URL'),
  MICROCMS_SERVICE_DOMAIN: z
    .string({ required_error: 'MICROCMS_SERVICE_DOMAIN is required' })
    .min(1, 'MICROCMS_SERVICE_DOMAIN cannot be empty'),
  MICROCMS_API_KEY: z
    .string({ required_error: 'MICROCMS_API_KEY is required' })
    .min(1, 'MICROCMS_API_KEY cannot be empty'),
  // REVALIDATE_SECRET: z
  //   .string({ required_error: 'REVALIDATE_SECRET is required' })
  //   .min(10, 'REVALIDATE_SECRET must be at least 10 characters'),
  // // オプションのキーは未定義を受け入れるが、指定された場合に空白のみの値に対しては依然としてガードする。
  // RESEND_API_KEY: z.string().min(1, 'RESEND_API_KEY cannot be empty').optional(),
  // CONTACT_TO: z.string().email('CONTACT_TO must be a valid email').optional(),
  // TURNSTILE_SECRET_KEY: z
  //   .string()
  //   .min(1, 'TURNSTILE_SECRET_KEY cannot be empty')
  //   .optional(),
});

// 環境変数の値をトリミングし、空白を未定義に折りたたむことで、オプションのスキーマフィールドがオプションのまま維持されるようにする。
// キーに特別な正規化が必要な場合（例：スラッグの小文字化）、このヘルパーを拡張する。
const normalize = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const rawEnv: RawEnv = {
  // NEXT_PUBLIC_BASE_URL: normalize(process.env.NEXT_PUBLIC_BASE_URL),
  MICROCMS_SERVICE_DOMAIN: normalize(process.env.MICROCMS_SERVICE_DOMAIN),
  MICROCMS_API_KEY: normalize(process.env.MICROCMS_API_KEY),
  // REVALIDATE_SECRET: normalize(process.env.REVALIDATE_SECRET),
  // RESEND_API_KEY: normalize(process.env.RESEND_API_KEY),
  // CONTACT_TO: normalize(process.env.CONTACT_TO),
  // TURNSTILE_SECRET_KEY: normalize(process.env.TURNSTILE_SECRET_KEY),
};

const result = EnvSchema.safeParse(rawEnv);

if (!result.success) {
  const issues = result.error.issues.map((issue) => {
    const path = issue.path.join('.') || 'environment';
    return `• ${path}: ${issue.message}`;
  });

  const errorMessage = ['Environment validation failed:', ...issues].join('\n');
  throw new Error(errorMessage);
}

export const ENV = result.data;
export type Env = typeof ENV;
