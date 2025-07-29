// prisma/seed.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const questionData = [
  {
    text: '休日の過ごし方は？',
    order: 1,
    choices: [{ text: 'アウトドア派' }, { text: 'インドア派' }],
  },
  {
    text: '会話は得意？',
    order: 2,
    choices: [{ text: '話すのが好き' }, { text: '聞くのが好き' }],
  },
  {
    text: 'イベントでの交流は？',
    order: 3,
    choices: [{ text: '大人数でワイワイ' }, { text: '少人数でじっくり' }],
  },
];

async function main() {
  console.log(`Start seeding ...`);

  for (const q of questionData) {
    const question = await prisma.question.create({
      data: {
        text: q.text,
        order: q.order,
        choices: {
          create: q.choices,
        },
      },
    });
    console.log(`Created question with id: ${question.id}`);
  }

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    // $disconnectはpromiseを返すのに適切に処理しないとエラーが出るため、voidを使用
    void prisma.$disconnect();
  });
