const mongooseService = require('../services/mongoose.cjs');
const Submission = require('../models/submission.model.cjs');

(async () => {
  try {
    await mongooseService.connect();
    console.log('Connected to MongoDB, inserting demo submission...');

    const doc = await Submission.create({
      contest_id: 'demo-contest',
      problem_index: 0,
      user_id: 'demo-user',
      username: 'demo',
      language_id: 71,
      code: 'console.log("hello world");',
      verdict: 'AC',
      status: 'finished',
      time: 10,
      memory: 128,
      code_length: 25,
      result: { stdout: 'hello world\n' }
    });

    console.log('Demo submission inserted with _id:', doc._id.toString());
  } catch (err) {
    console.error('Failed to insert demo submission:', err);
    process.exitCode = 2;
  } finally {
    await mongooseService.disconnect();
  }
})();
