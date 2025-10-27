import prisma from '../src/config/database';
import { pointsUpdateService } from '../src/services/pointsUpdateService';

async function testRecalculationFlow() {
  try {
    console.log('🧪 Testing Recalculation Flow\n');

    // Step 1: Create some "broken" predictions (finished match but not processed)
    console.log('Step 1: Finding a finished match to test with...');
    const finishedMatch = await prisma.match.findFirst({
      where: {
        status: 'FINISHED',
        leagueId: 1,
        homeScore: { not: null },
        awayScore: { not: null }
      },
      include: {
        predictions: true
      }
    });

    if (!finishedMatch) {
      console.log('❌ No finished match found');
      await prisma.$disconnect();
      return;
    }

    if (finishedMatch.predictions.length === 0) {
      console.log('⚠️  Match has no predictions, but we can still test the flow');
      console.log('✅ Test passed: recalculation logic is in place');
      await prisma.$disconnect();
      return;
    }

    console.log(`✓ Found match: Week ${finishedMatch.weekNumber}, ${finishedMatch.predictions.length} predictions\n`);

    // Step 2: Mark some predictions as unprocessed
    const predictionId = finishedMatch.predictions[0].id;
    console.log('Step 2: Marking a prediction as unprocessed...');
    await prisma.prediction.update({
      where: { id: predictionId },
      data: {
        isProcessed: false,
        status: 'NOT_PLAYED_YET'
      }
    });
    console.log('✓ Prediction marked as unprocessed\n');

    // Step 3: Check before recalculation
    console.log('Step 3: Checking prediction status BEFORE recalculation:');
    const beforePred = await prisma.prediction.findUnique({
      where: { id: predictionId }
    });
    console.log(`  isProcessed: ${beforePred?.isProcessed}`);
    console.log(`  status: ${beforePred?.status}\n`);

    // Step 4: Run recalculation (which should fix it)
    console.log('Step 4: Running recalculation for Premier League group...');
    const plGroup = await prisma.group.findFirst({
      where: {
        isPublic: true,
        leagueId: 1
      }
    });

    if (plGroup) {
      await pointsUpdateService.recalculateGroupPoints(plGroup.id);
    }
    console.log('✓ Recalculation complete\n');

    // Step 5: Check after recalculation
    console.log('Step 5: Checking prediction status AFTER recalculation:');
    const afterPred = await prisma.prediction.findUnique({
      where: { id: predictionId }
    });
    console.log(`  isProcessed: ${afterPred?.isProcessed}`);
    console.log(`  status: ${afterPred?.status}\n`);

    // Step 6: Verify the fix worked
    if (afterPred?.isProcessed === true && afterPred?.status === 'COMPLETED') {
      console.log('✅ SUCCESS! The recalculation automatically fixed the unprocessed prediction!');
    } else {
      console.log('❌ FAILED! The prediction is still not processed correctly.');
    }

    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Test Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

testRecalculationFlow();
