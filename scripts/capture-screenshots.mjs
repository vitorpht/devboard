import puppeteer from "puppeteer";
import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const outDir = path.join(root, "docs", "screenshots");
const baseUrl = "http://localhost:3456/";

const sampleData = {
  theme: "light",
  projects: [
    {
      id: "a1b2c3d4-e5f6-4789-a012-345678901001",
      name: "Personal",
      description: "Side projects, health, and personal goals.",
      createdAt: 1717200000000,
    },
    {
      id: "a1b2c3d4-e5f6-4789-a012-345678901002",
      name: "Work",
      description: "Day-to-day professional tasks and deliverables.",
      createdAt: 1717286400000,
    },
    {
      id: "a1b2c3d4-e5f6-4789-a012-345678901003",
      name: "Learning",
      description: "Courses, reading, and skill development.",
      createdAt: 1717372800000,
    },
  ],
  tasks: [
    {
      id: "b1c2d3e4-f5a6-4789-b012-345678901001",
      title: "Review monthly budget",
      description: "Track expenses and update savings goals for June.",
      priority: "Low",
      completed: true,
      projectId: "a1b2c3d4-e5f6-4789-a012-345678901001",
      createdAt: 1717400000000,
    },
    {
      id: "b1c2d3e4-f5a6-4789-b012-345678901002",
      title: "Schedule dentist appointment",
      description: "Book a routine check-up for next week.",
      priority: "Medium",
      completed: false,
      projectId: "a1b2c3d4-e5f6-4789-a012-345678901001",
      createdAt: 1717410000000,
    },
    {
      id: "b1c2d3e4-f5a6-4789-b012-345678901003",
      title: "Prepare sprint demo slides",
      description: "Summarize shipped features and upcoming milestones.",
      priority: "High",
      completed: true,
      projectId: "a1b2c3d4-e5f6-4789-a012-345678901002",
      createdAt: 1717420000000,
    },
    {
      id: "b1c2d3e4-f5a6-4789-b012-345678901004",
      title: "Update API documentation",
      description: "Document new authentication endpoints and error codes.",
      priority: "Medium",
      completed: false,
      projectId: "a1b2c3d4-e5f6-4789-a012-345678901002",
      createdAt: 1717430000000,
    },
    {
      id: "b1c2d3e4-f5a6-4789-b012-345678901005",
      title: "Fix login redirect bug",
      description: "Users are sent to the wrong page after OAuth callback.",
      priority: "High",
      completed: false,
      projectId: "a1b2c3d4-e5f6-4789-a012-345678901002",
      createdAt: 1717440000000,
    },
    {
      id: "b1c2d3e4-f5a6-4789-b012-345678901006",
      title: "Complete TypeScript module 4",
      description: "Finish generics and utility types exercises.",
      priority: "Medium",
      completed: true,
      projectId: "a1b2c3d4-e5f6-4789-a012-345678901003",
      createdAt: 1717450000000,
    },
    {
      id: "b1c2d3e4-f5a6-4789-b012-345678901007",
      title: "Build portfolio project landing page",
      description: "Design hero section and feature highlights for DevBoard.",
      priority: "High",
      completed: false,
      projectId: "a1b2c3d4-e5f6-4789-a012-345678901003",
      createdAt: 1717460000000,
    },
    {
      id: "b1c2d3e4-f5a6-4789-b012-345678901008",
      title: "Read Clean Code chapter 5",
      description: "Take notes on formatting and naming conventions.",
      priority: "Low",
      completed: false,
      projectId: "a1b2c3d4-e5f6-4789-a012-345678901003",
      createdAt: 1717470000000,
    },
    {
      id: "b1c2d3e4-f5a6-4789-b012-345678901009",
      title: "Practice system design interview",
      description: "Review URL shortener architecture and trade-offs.",
      priority: "Medium",
      completed: true,
      projectId: "a1b2c3d4-e5f6-4789-a012-345678901003",
      createdAt: 1717480000000,
    },
  ],
};

async function loadWithTheme(page, theme) {
  const data = { ...sampleData, theme };
  await page.goto(baseUrl, { waitUntil: "networkidle0" });
  await page.evaluate((payload) => {
    localStorage.setItem("devboard_data", JSON.stringify(payload));
  }, data);
  await page.reload({ waitUntil: "networkidle0" });
  await page.waitForSelector('[data-stat="total"]');
  await page.waitForFunction(
    () => document.querySelector('[data-stat="total"]').textContent !== "0"
  );
}

async function screenshotViewport(page, fileName) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise((resolve) => setTimeout(resolve, 400));
  await page.screenshot({
    path: path.join(outDir, fileName),
    type: "png",
    fullPage: false,
  });
}

async function screenshotSection(page, selector, fileName, fullElement = false) {
  const section = await page.$(selector);
  if (!section) {
    throw new Error(`Missing selector: ${selector}`);
  }

  if (fullElement) {
    await section.evaluate((el) =>
      el.scrollIntoView({ block: "start", behavior: "instant" })
    );
    await new Promise((resolve) => setTimeout(resolve, 400));
    await section.screenshot({
      path: path.join(outDir, fileName),
      type: "png",
    });
    return;
  }

  await section.evaluate((el) =>
    el.scrollIntoView({ block: "start", behavior: "instant" })
  );
  await new Promise((resolve) => setTimeout(resolve, 400));

  await page.screenshot({
    path: path.join(outDir, fileName),
    type: "png",
    fullPage: false,
  });
}

await mkdir(outDir, { recursive: true });

const browser = await puppeteer.launch({
  headless: "new",
  defaultViewport: { width: 1440, height: 900 },
});
const page = await browser.newPage();

await loadWithTheme(page, "light");
await screenshotViewport(page, "dashboard-light.png");

await loadWithTheme(page, "dark");
await page.waitForFunction(() =>
  document.documentElement.classList.contains("dark")
);
await screenshotViewport(page, "dashboard-dark.png");

await loadWithTheme(page, "light");
await page.waitForFunction(
  () => document.querySelectorAll("#task-list li").length >= 8
);

await screenshotSection(page, "#tasks-section", "tasks-management.png", true);
await screenshotSection(page, "#projects-section", "projects-management.png", true);

await browser.close();
console.log("Screenshots saved to", outDir);
