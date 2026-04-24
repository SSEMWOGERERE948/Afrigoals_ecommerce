import { createAgentUIStreamResponse, type UIMessage } from "ai";
import { createShoppingAgent } from "@/lib/ai/shopping-agent";

export async function POST(request: Request) {
  const { messages }: { messages: UIMessage[] } = await request.json();

  // Auth is now handled via JWT cookies; orders are still being migrated.
  const agent = createShoppingAgent({ userId: null });

  return createAgentUIStreamResponse({
    agent,
    messages,
  });
}
