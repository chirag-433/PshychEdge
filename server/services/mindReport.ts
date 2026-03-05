import { db } from "../db";
import { trades, behavioralLogs, mindReports } from "@shared/schema";
import { desc, gte } from "drizzle-orm";
import { sendTelegramMessage } from "./telegram";

export async function generateMindReport() {
  // Get the start of the current week (Monday)
  const now = new Date();
  const dayOfWeek = now.getDay();
  const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const weekStart = new Date(now.setHours(0, 0, 0, 0));
  weekStart.setDate(diff);

  // Fetch trades from this week
  const weekTrades = await db
    .select()
    .from(trades)
    .where(gte(trades.enteredAt, weekStart));

  // Fetch behavioral logs from this week
  const weekLogs = await db
    .select()
    .from(behavioralLogs)
    .where(gte(behavioralLogs.createdAt, weekStart));

  // Calculate metrics
  const totalTrades = weekTrades.length;
  const closedTrades = weekTrades.filter((t) => t.status === "closed");
  const winningTrades = closedTrades.filter((t) => (t.pnl || 0) > 0);
  const losingTrades = closedTrades.filter((t) => (t.pnl || 0) < 0);

  const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winRate =
    closedTrades.length > 0
      ? Math.round((winningTrades.length / closedTrades.length) * 100)
      : 0;

  const avgWin =
    winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) /
        winningTrades.length
      : 0;

  const avgLoss =
    losingTrades.length > 0
      ? Math.abs(
          losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) /
            losingTrades.length
        )
      : 0;

  const riskRewardRatio = avgLoss > 0 ? +(avgWin / avgLoss).toFixed(2) : 0;

  // Discipline score
  const tradesWithDiscipline = closedTrades.filter(
    (t) => t.disciplineScore != null
  );
  const avgDiscipline =
    tradesWithDiscipline.length > 0
      ? Math.round(
          tradesWithDiscipline.reduce(
            (sum, t) => sum + (t.disciplineScore || 0),
            0
          ) / tradesWithDiscipline.length
        )
      : 0;

  // Emotion analysis
  const emotionCounts = weekTrades.reduce(
    (acc, t) => {
      const emotion = t.emotionBefore || "unknown";
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const fomoTrades = weekTrades.filter(
    (t) => t.emotionBefore === "excited"
  ).length;
  const revengeTrades = weekTrades.filter(
    (t) => t.emotionBefore === "revenge"
  ).length;

  // Behavioral flags
  const highSeverityEvents = weekLogs.filter(
    (l) => l.severity === "high"
  ).length;
  const mediumSeverityEvents = weekLogs.filter(
    (l) => l.severity === "medium"
  ).length;

  // Build insights
  const insights: string[] = [];

  if (winRate >= 60)
    insights.push("Strong win rate this week — keep executing your plan.");
  else if (winRate >= 40)
    insights.push(
      "Win rate is average. Review your signal selection criteria."
    );
  else if (closedTrades.length > 0)
    insights.push(
      "Low win rate this week. Consider tightening entry conditions."
    );

  if (riskRewardRatio >= 2)
    insights.push("Excellent risk-reward ratio. Your sizing is on point.");
  else if (riskRewardRatio >= 1)
    insights.push("Risk-reward is acceptable but could improve with tighter stop-losses.");
  else if (closedTrades.length > 0)
    insights.push("Risk-reward below 1:1 — your losses outweigh wins on average.");

  if (fomoTrades > 0)
    insights.push(
      `Detected ${fomoTrades} FOMO-driven entries. Slow down before entering trades.`
    );
  if (revengeTrades > 0)
    insights.push(
      `${revengeTrades} revenge trades detected. Take breaks after losses.`
    );
  if (highSeverityEvents > 0)
    insights.push(
      `${highSeverityEvents} high-severity behavioral alerts. Review your discipline.`
    );
  if (avgDiscipline > 0 && avgDiscipline < 50)
    insights.push(
      "Low average discipline score. Follow your trading plan more strictly."
    );

  if (insights.length === 0)
    insights.push("Not enough data this week for actionable insights. Keep journaling your trades!");

  const reportData = {
    weekStart: weekStart.toISOString(),
    weekEnd: new Date().toISOString(),
    totalTrades,
    closedTrades: closedTrades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    totalPnl: +totalPnl.toFixed(2),
    winRate,
    avgWin: +avgWin.toFixed(2),
    avgLoss: +avgLoss.toFixed(2),
    riskRewardRatio,
    avgDiscipline,
    emotionCounts,
    fomoTrades,
    revengeTrades,
    highSeverityEvents,
    mediumSeverityEvents,
    insights,
  };

  // Save to database
  const [saved] = await db
    .insert(mindReports)
    .values({
      reportData,
      weekStart,
    })
    .returning();

  // Send Telegram notification
  const topInsight = reportData.insights[0] || "No insights this week.";
  const telegramMessage = `
🧠 <b>PsychEdge Weekly Mind Report</b>

📊 <b>This Week's Performance:</b>
- Trades: ${reportData.totalTrades} total (${reportData.closedTrades} closed)
- Win Rate: ${reportData.winRate}%
- P&amp;L: $${reportData.totalPnl}
- Risk:Reward: ${reportData.riskRewardRatio > 0 ? `1:${reportData.riskRewardRatio}` : "N/A"}
- Discipline: ${reportData.avgDiscipline > 0 ? `${reportData.avgDiscipline}/100` : "N/A"}

🚨 <b>Behavioral Flags:</b>
- FOMO Entries: ${reportData.fomoTrades}
- Revenge Trades: ${reportData.revengeTrades}
- High Severity Alerts: ${reportData.highSeverityEvents}

💡 <b>Top Insight:</b>
${topInsight}

<i>Open PsychEdge Pro for full report →</i>
`;

  await sendTelegramMessage(telegramMessage);

  return { ...saved, reportData };
}
