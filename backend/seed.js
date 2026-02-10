require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Election = require('./models/Election');
const Candidate = require('./models/Candidate');
const connectDB = require('./config/db');

const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Election.deleteMany({});
    await Candidate.deleteMany({});

    // Create admin user
    console.log('Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      voterId: 'ADMIN001',
      name: 'System Administrator',
      password: adminPassword,
      role: 'admin'
    });
    console.log('Admin created: ADMIN001 / admin123');

    // Create sample voters
    console.log('Creating sample voters...');
    const voterPassword = await bcrypt.hash('voter123', 10);
    const voters = [];
    for (let i = 1; i <= 10; i++) {
      const voter = await User.create({
        voterId: `VOTER${String(i).padStart(3, '0')}`,
        name: `Voter ${i}`,
        password: voterPassword,
        role: 'voter'
      });
      voters.push(voter);
      console.log(`Voter created: VOTER${String(i).padStart(3, '0')} / voter123`);
    }

    // Create sample election
    console.log('Creating sample election...');
    const now = new Date();
    const startDate = new Date(now.getTime() - 1000 * 60 * 60); // 1 hour ago
    const endDate = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7); // 7 days from now

    const election = await Election.create({
      title: 'Local Body Election 2024',
      description: 'Election for the local municipal council',
      startDate: startDate,
      endDate: endDate,
      status: 'active',
      createdBy: admin._id
    });
    console.log('Election created:', election.title);

    // Create sample candidates
    console.log('Creating sample candidates...');
    const candidatesData = [
      { name: 'John Smith', party: 'Progressive Party', symbol: '🌟' },
      { name: 'Mary Johnson', party: 'Unity Alliance', symbol: '🦁' },
      { name: 'Robert Brown', party: 'Development Front', symbol: '🌺' },
      { name: 'Sarah Davis', party: 'People\'s Movement', symbol: '🌊' },
      { name: 'Michael Wilson', party: 'Reform Coalition', symbol: '🔥' }
    ];

    for (const candidateData of candidatesData) {
      await Candidate.create({
        ...candidateData,
        election: election._id,
        description: `Committed to serving the community`
      });
      console.log(`Candidate created: ${candidateData.name} (${candidateData.party})`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\nLogin Credentials:');
    console.log('==================');
    console.log('Admin: ADMIN001 / admin123');
    console.log('Voters: VOTER001 to VOTER010 / voter123');
    console.log('\nElection Status: active');
    console.log('Ready to vote!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
