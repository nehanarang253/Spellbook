import { NextResponse } from "next/server";
import { parseBody, toErrorResponse } from "@/lib/api";
import { reviewRequestSchema } from "@/lib/schemas";
import { reviewContract } from "@/lib/workflows/review";
import type { Issue } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { contract, playbook } = await parseBody(request, reviewRequestSchema);
    const issues = await reviewContract(contract, playbook);
    return NextResponse.json<{ issues: Issue[] }>({ issues });
  } catch (error) {
    return toErrorResponse(error);
  }
}
