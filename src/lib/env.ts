import { z } from 'zod';

type RawEnv = {
  MICROCMS_SERVICE_DOMAIN: string | undefined;
  MICROCMS_API_KEY: string | undefined;
};

const EnvSchema = z.object({
  MICROCMS_SERVICE_DOMAIN: z
    .string({ required_error: 'MICROCMS_SERVICE_DOMAIN is required' })
    .min(1, 'MICROCMS_SERVICE_DOMAIN cannot be empty'),
  MICROCMS_API_KEY: z
    .string({ required_error: 'MICROCMS_API_KEY is required' })
    .min(1, 'MICROCMS_API_KEY cannot be empty'),
});

// 環境変数の値をトリミングし、空白を未定義に折りたたむことで、オプションのスキーマフィールドがオプションのまま維持されるようにする。
// キーに特別な正規化が必要な場合（例：スラッグの小文字化）、このヘルパーを拡張する。
const normalize = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

const rawEnv: RawEnv = {
  MICROCMS_SERVICE_DOMAIN: normalize(process.env.MICROCMS_SERVICE_DOMAIN),
  MICROCMS_API_KEY: normalize(process.env.MICROCMS_API_KEY),
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
