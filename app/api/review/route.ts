import { NextResponse } from "next/server";
import { parseBody, toErrorResponse } from "@/lib/api";
import { reviewRequestSchema } from "@/lib/schemas";
import { reviewContract } from "@/lib/workflows/review";
import type { ReviewResult } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { contract, playbook } = await parseBody(request, reviewRequestSchema);
    const result = await reviewContract(contract, playbook);
    return NextResponse.json<ReviewResult>(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
