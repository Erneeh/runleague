export function getCurrentWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0 (Sun) - 6 (Sat)

  // Treat Monday as the first day of the week
  const diffToMonday = (day + 6) % 7;

  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - diffToMonday);

  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return {
    start,
    end,
  };
}

export function formatWeekLabel(start: Date, end: Date) {
  const startStr = start.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const endStr = end.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return `${startStr} – ${endStr}`;
}

