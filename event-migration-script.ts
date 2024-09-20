const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateEvents() {
    const oldEvents = await prisma.event.findMany({
        where: {
            date: { not: undefined },
            start: null,
        },
    });

    for (const event of oldEvents) {
        await prisma.event.update({
            where: { id: event.id },
            data: {
                start: event.date,
                end: new Date(event.date.getTime() + 60 * 60 * 1000), // 1 saat sonrası
                color: '#3788d8', // Varsayılan renk
            },
        });
    }

    console.log(`${oldEvents.length} etkinlik güncellendi.`);
}

migrateEvents()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());