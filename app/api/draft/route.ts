import { NextResponse } from "next/server";
import { parseBody, toErrorResponse } from "@/lib/api";
import { draftRequestSchema } from "@/lib/schemas";
import { draftClause } from "@/lib/workflows/draft";
import type { DraftResult } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { instruction, precedent, contract } = await parseBody(request, draftRequestSchema);
    const result = await draftClause(instruction, precedent, contract);
    return NextResponse.json<DraftResult>(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
