const mongoose = require('mongoose');
const User = require('./models/User');
const Item = require('./models/Item');
const Request = require('./models/Request');
const UsageLog = require('./models/UsageLog');
const config = require('./config');

// Connect to MongoDB
mongoose.connect(config.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to MongoDB for seeding');
})
.catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
});

// Sample data
const users = [
    {
        name: 'Admin User',
        email: 'admin@college.edu',
        password: 'admin123',
        role: 'admin',
        department: 'admin'
    },
    {
        name: 'Lab Staff',
        email: 'staff@college.edu',
        password: 'staff123',
        role: 'staff',
        department: 'lab'
    },
    {
        name: 'Library Manager',
        email: 'library@college.edu',
        password: 'library123',
        role: 'staff',
        department: 'library'
    },
    {
        name: 'Sports Coordinator',
        email: 'sports@college.edu',
        password: 'sports123',
        role: 'staff',
        department: 'sports'
    }
];

const items = [
    {
        name: 'Laptop Computers',
        category: 'electronics',
        quantity: 25,
        department: 'lab',
        description: 'Dell Latitude laptops for computer lab',
        minStockLevel: 5,
        location: 'Computer Lab A'
    },
    {
        name: 'Microscopes',
        category: 'lab_equipment',
        quantity: 15,
        department: 'lab',
        description: 'Scientific microscopes for biology lab',
        minStockLevel: 3,
        location: 'Biology Lab'
    },
    {
        name: 'Textbooks',
        category: 'books',
        quantity: 100,
        department: 'library',
        description: 'Various textbooks for different subjects',
        minStockLevel: 20,
        location: 'Main Library'
    },
    {
        name: 'Basketballs',
        category: 'sports',
        quantity: 8,
        department: 'sports',
        description: 'Official basketballs for sports activities',
        minStockLevel: 3,
        location: 'Sports Complex'
    },
    {
        name: 'Office Chairs',
        category: 'furniture',
        quantity: 12,
        department: 'admin',
        description: 'Ergonomic office chairs',
        minStockLevel: 2,
        location: 'Administration Building'
    },
    {
        name: 'Printer Paper',
        category: 'office_supplies',
        quantity: 50,
        department: 'general',
        description: 'A4 printer paper (500 sheets per pack)',
        minStockLevel: 10,
        location: 'Storage Room'
    },
    {
        name: 'Projectors',
        category: 'electronics',
        quantity: 3,
        department: 'lab',
        description: 'HD projectors for presentations',
        minStockLevel: 1,
        location: 'Conference Room'
    },
    {
        name: 'Football Equipment',
        category: 'sports',
        quantity: 5,
        department: 'sports',
        description: 'Football helmets and pads',
        minStockLevel: 2,
        location: 'Sports Equipment Room'
    }
];

// Seed function
async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Item.deleteMany({});
        await Request.deleteMany({});
        await UsageLog.deleteMany({});

        console.log('🗑️ Cleared existing data');

        // Create users
        const createdUsers = [];
        for (const userData of users) {
            const user = new User(userData);
            await user.save();
            createdUsers.push(user);
            console.log(`👤 Created user: ${user.name} (${user.email})`);
        }

        // Create items
        const createdItems = [];
        for (const itemData of items) {
            const item = new Item(itemData);
            await item.save();
            createdItems.push(item);
            console.log(`📦 Created item: ${item.name}`);
        }

        // Create sample requests
        const sampleRequests = [
            {
                itemId: createdItems[0]._id, // Laptops
                userId: createdUsers[1]._id, // Lab Staff
                quantity: 2,
                reason: 'New students joining computer science course',
                priority: 'high',
                status: 'pending',
                department: 'lab'
            },
            {
                itemId: createdItems[2]._id, // Textbooks
                userId: createdUsers[2]._id, // Library Manager
                quantity: 10,
                reason: 'Additional copies needed for popular courses',
                priority: 'medium',
                status: 'approved',
                department: 'library'
            },
            {
                itemId: createdItems[3]._id, // Basketballs
                userId: createdUsers[3]._id, // Sports Coordinator
                quantity: 3,
                reason: 'Replacement for worn-out basketballs',
                priority: 'low',
                status: 'completed',
                department: 'sports'
            }
        ];

        for (const requestData of sampleRequests) {
            const request = new Request(requestData);
            await request.save();
            console.log(`📋 Created request: ${request.reason}`);
        }

        // Create sample usage logs
        const sampleUsageLogs = [
            {
                itemId: createdItems[0]._id, // Laptops
                userId: createdUsers[1]._id,
                quantityUsed: 1,
                department: 'lab',
                purpose: 'Computer programming class',
                dateUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
            },
            {
                itemId: createdItems[1]._id, // Microscopes
                userId: createdUsers[1]._id,
                quantityUsed: 2,
                department: 'lab',
                purpose: 'Biology lab session',
                dateUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
            },
            {
                itemId: createdItems[2]._id, // Textbooks
                userId: createdUsers[2]._id,
                quantityUsed: 5,
                department: 'library',
                purpose: 'Student checkouts',
                dateUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
            },
            {
                itemId: createdItems[3]._id, // Basketballs
                userId: createdUsers[3]._id,
                quantityUsed: 1,
                department: 'sports',
                purpose: 'Basketball tournament',
                dateUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            }
        ];

        for (const logData of sampleUsageLogs) {
            const log = new UsageLog(logData);
            await log.save();
            console.log(`📊 Created usage log: ${log.purpose}`);
        }

        console.log('\n✅ Database seeding completed successfully!');
        console.log('\n📋 Demo Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('👑 Admin: admin@college.edu / admin123');
        console.log('👨‍💼 Lab Staff: staff@college.edu / staff123');
        console.log('📚 Library: library@college.edu / library123');
        console.log('⚽ Sports: sports@college.edu / sports123');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🚀 You can now start the server and test the system!');

    } catch (error) {
        console.error('❌ Seeding error:', error);
    } finally {
        mongoose.connection.close();
        console.log('🔌 Database connection closed');
    }
}

// Run seeding
seedDatabase(); 