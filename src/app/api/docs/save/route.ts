export const runtime = "nodejs";
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

function toMarkdown(run: any) {
  const created = typeof run.createdAt === "string" ? run.createdAt : run.createdAt?.toISOString?.() ?? "";
  const lines = [
    `# Agent Run`,
    ``,
    `**Run ID:** ${run.id}`,
    `**User ID:** ${run.userId ?? "-"}`,
    `**Created:** ${created}`,
    ``,
    `## Goal`,
    run.goal,
    ``,
    `## Output`,
    "```json",
    run.output,
    "```"
  ];
  return lines.join("\n");
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const runId = searchParams.get("runId");

  let run: any = null;
  if (runId) {
    run = await prisma.agentRun.findUnique({ where: { id: runId } });
  } else {
    run = await prisma.agentRun.findFirst({ orderBy: { createdAt: "desc" } });
  }
  if (!run) return NextResponse.json({ error: "No runs found" }, { status: 404 });

  const md = toMarkdown(run);
  return new NextResponse(md, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="agent-run-${run.id}.md"`
    }
  });
}
