import { handleRevalidate } from './handler';

export async function POST(request: Request) {
  return handleRevalidate(request);
}
