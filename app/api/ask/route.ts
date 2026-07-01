import { NextResponse } from "next/server";
import { parseBody, toErrorResponse } from "@/lib/api";
import { askRequestSchema } from "@/lib/schemas";
import { askContract } from "@/lib/workflows/ask";
import type { AskResult } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const { contract, question } = await parseBody(request, askRequestSchema);
    const result = await askContract(contract, question);
    return NextResponse.json<AskResult>(result);
  } catch (error) {
    return toErrorResponse(error);
  }
}
