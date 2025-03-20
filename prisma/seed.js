import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create a demo user
  const hashedPassword = await hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "demo@example.com" },
    update: {},
    create: {
      email: "demo@example.com",
      name: "Demo User",
      password: hashedPassword,
    },
  });

  console.log(`Created demo user: ${user.email}`);

  // Create sample energy logs
  const today = new Date();

  for (let i = 0; i < 10; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    await prisma.energyLog.create({
      data: {
        userId: user.id,
        energyLevel: Math.floor(Math.random() * 30) + 60, // Random between 60-90
        focusLevel: Math.floor(Math.random() * 30) + 60, // Random between 60-90
        notes: i % 3 === 0 ? "Feeling productive today" : undefined,
        date: date,
      },
    });
  }

  console.log("Created sample energy logs");

  // Create sample skills
  const skills = [
    {
      name: "JavaScript",
      category: "Programming",
      progress: 75,
      hoursSpent: 120,
    },
    { name: "React", category: "Programming", progress: 65, hoursSpent: 80 },
    { name: "Node.js", category: "Programming", progress: 50, hoursSpent: 60 },
    { name: "Spanish", category: "Language", progress: 40, hoursSpent: 50 },
    { name: "Guitar", category: "Music", progress: 30, hoursSpent: 40 },
  ];

  for (const skill of skills) {
    await prisma.skill.create({
      data: {
        userId: user.id,
        name: skill.name,
        category: skill.category,
        progress: skill.progress,
        hoursSpent: skill.hoursSpent,
        lastPracticed: new Date(),
      },
    });
  }

  console.log("Created sample skills");

  // Create sample notes
  const notes = [
    {
      title: "JavaScript Closures",
      content:
        "Closures are functions that have access to variables from an outer function scope.",
      category: "Programming",
    },
    {
      title: "React Hooks",
      content:
        "useState, useEffect, useContext, useReducer, useCallback, useMemo, useRef...",
      category: "Programming",
    },
    {
      title: "Spanish Verb Conjugations",
      content: "Present tense: hablo, hablas, habla, hablamos, habláis, hablan",
      category: "Language",
    },
    {
      title: "Guitar Chord Progressions",
      content: "Common progressions: I-IV-V, ii-V-I, I-V-vi-IV",
      category: "Music",
    },
  ];

  for (const note of notes) {
    await prisma.note.create({
      data: {
        userId: user.id,
        title: note.title,
        content: note.content,
        category: note.category,
      },
    });
  }

  console.log("Created sample notes");

  // Create sample todos
  const todos = [
    {
      title: "Complete project proposal",
      description: "Finish the draft and send for review",
      priority: "high",
      category: "Work",
      dueDate: new Date(today.getTime() + 86400000 * 3),
    },
    {
      title: "Buy groceries",
      description: "Milk, eggs, bread, vegetables",
      priority: "medium",
      category: "Personal",
      dueDate: new Date(today.getTime() + 86400000 * 1),
    },
    {
      title: "Study React hooks",
      description: "Focus on useContext and useReducer",
      priority: "medium",
      category: "Learning",
      dueDate: new Date(today.getTime() + 86400000 * 5),
    },
    {
      title: "Call dentist",
      description: "Schedule annual checkup",
      priority: "low",
      category: "Health",
      completed: true,
    },
  ];

  for (const todo of todos) {
    await prisma.todo.create({
      data: {
        userId: user.id,
        title: todo.title,
        description: todo.description,
        priority: todo.priority,
        category: todo.category,
        dueDate: todo.dueDate,
        completed: todo.completed || false,
      },
    });
  }

  console.log("Created sample todos");

  // Create sample habits
  const habits = [
    {
      name: "Morning Meditation",
      description: "10 minutes of mindfulness meditation",
      category: "Mindfulness",
      frequency: "daily",
      color: "blue",
    },
    {
      name: "Exercise",
      description: "30 minutes of physical activity",
      category: "Health",
      frequency: "daily",
      color: "red",
    },
    {
      name: "Read",
      description: "Read for at least 30 minutes",
      category: "Learning",
      frequency: "daily",
      color: "green",
    },
  ];

  for (const habit of habits) {
    const createdHabit = await prisma.habit.create({
      data: {
        userId: user.id,
        name: habit.name,
        description: habit.description,
        category: habit.category,
        frequency: habit.frequency,
        color: habit.color,
      },
    });

    // Add some completions
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      await prisma.habitCompletion.create({
        data: {
          habitId: createdHabit.id,
          userId: user.id,
          date: date,
          completed: Math.random() > 0.3, // 70% chance of completion
        },
      });
    }
  }

  console.log("Created sample habits with completions");

  // Create sample journal entries
  const moods = ["happy", "calm", "productive", "tired", "anxious"];
  const tags = [
    "work",
    "personal",
    "health",
    "learning",
    "family",
    "friends",
    "goals",
    "gratitude",
  ];

  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    const randomMood = moods[Math.floor(Math.random() * moods.length)];
    const randomTags = tags
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 3) + 1);

    await prisma.journalEntry.create({
      data: {
        userId: user.id,
        title: `Journal Entry for ${date.toLocaleDateString()}`,
        content: `This is a sample journal entry for ${date.toLocaleDateString()}. It was a ${randomMood} day.`,
        mood: randomMood,
        tags: randomTags,
        date: date,
      },
    });
  }

  console.log("Created sample journal entries");

  // Create sample goals
  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: "Learn JavaScript Deeply",
      description: "Master advanced JavaScript concepts and frameworks",
      category: "education",
      targetDate: new Date(today.getTime() + 86400000 * 90), // 90 days from now
      progress: 40,
    },
  });

  // Create milestones for the goal
  const milestone1 = await prisma.milestone.create({
    data: {
      userId: user.id,
      goalId: goal.id,
      title: "Learn React fundamentals",
      description: "Understand core React concepts and build a simple app",
      dueDate: new Date(today.getTime() + 86400000 * 30), // 30 days from now
      completed: true,
    },
  });

  // Create tasks for the milestone
  await prisma.task.create({
    data: {
      userId: user.id,
      milestoneId: milestone1.id,
      title: "Complete React basics course",
      description: "Finish the intro course on React",
      completed: true,
    },
  });

  await prisma.task.create({
    data: {
      userId: user.id,
      milestoneId: milestone1.id,
      title: "Build a todo app",
      description: "Create a simple todo app with React",
      completed: true,
    },
  });

  const milestone2 = await prisma.milestone.create({
    data: {
      userId: user.id,
      goalId: goal.id,
      title: "Master state management",
      description: "Learn Redux and Context API for state management",
      dueDate: new Date(today.getTime() + 86400000 * 60), // 60 days from now
      completed: false,
    },
  });

  await prisma.task.create({
    data: {
      userId: user.id,
      milestoneId: milestone2.id,
      title: "Learn Redux basics",
      description: "Understand actions, reducers, and store",
      completed: true,
    },
  });

  await prisma.task.create({
    data: {
      userId: user.id,
      milestoneId: milestone2.id,
      title: "Implement Redux in a project",
      description: "Add Redux to an existing project",
      completed: false,
    },
  });

  console.log("Created sample goals, milestones, and tasks");

  // Create sample books
  const books = [
    {
      title: "Atomic Habits",
      author: "James Clear",
      type: "physical",
      category: "Self-Improvement",
      status: "completed",
      rating: 5,
    },
    {
      title: "Deep Work",
      author: "Cal Newport",
      type: "ebook",
      category: "Productivity",
      status: "reading",
    },
    {
      title: "The Psychology of Money",
      author: "Morgan Housel",
      type: "audiobook",
      category: "Finance",
      status: "to-read",
    },
  ];

  for (const book of books) {
    await prisma.book.create({
      data: {
        userId: user.id,
        title: book.title,
        author: book.author,
        type: book.type,
        category: book.category,
        status: book.status,
        rating: book.rating,
      },
    });
  }

  console.log("Created sample books");

  // Create sample financial data
  const transactions = [
    {
      amount: 2500,
      type: "income",
      category: "Salary",
      description: "Monthly salary",
      date: new Date(today.getFullYear(), today.getMonth(), 1),
    },
    {
      amount: 500,
      type: "expense",
      category: "Rent",
      description: "Monthly rent",
      date: new Date(today.getFullYear(), today.getMonth(), 5),
    },
    {
      amount: 120,
      type: "expense",
      category: "Groceries",
      description: "Weekly groceries",
      date: new Date(today.getFullYear(), today.getMonth(), 10),
    },
    {
      amount: 80,
      type: "expense",
      category: "Utilities",
      description: "Electricity bill",
      date: new Date(today.getFullYear(), today.getMonth(), 15),
    },
    {
      amount: 200,
      type: "expense",
      category: "Entertainment",
      description: "Concert tickets",
      date: new Date(today.getFullYear(), today.getMonth(), 20),
    },
    {
      amount: 300,
      type: "income",
      category: "Freelance",
      description: "Design project",
      date: new Date(today.getFullYear(), today.getMonth(), 25),
    },
  ];

  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: {
        userId: user.id,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        date: transaction.date,
      },
    });
  }

  console.log("Created sample transactions");

  // Create sample budgets
  const budgets = [
    { category: "Groceries", amount: 400, period: "monthly" },
    { category: "Entertainment", amount: 200, period: "monthly" },
    { category: "Utilities", amount: 150, period: "monthly" },
  ];

  for (const budget of budgets) {
    await prisma.budget.create({
      data: {
        userId: user.id,
        category: budget.category,
        amount: budget.amount,
        spent: Math.floor(Math.random() * budget.amount),
        period: budget.period,
      },
    });
  }

  console.log("Created sample budgets");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
