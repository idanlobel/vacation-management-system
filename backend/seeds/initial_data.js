/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function (knex) {
    // Deletes ALL existing entries
    await knex('vacation_requests').del();
    await knex('users').del();

    // Inserts seed entries
    await knex('users').insert([
        {
            id: 1,
            name: 'John Doe',
            email: 'john.doe@company.com',
            role: 'requester'
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane.smith@company.com',
            role: 'requester'
        },
        {
            id: 3,
            name: 'Mike Johnson',
            email: 'mike.johnson@company.com',
            role: 'validator'
        },
        {
            id: 4,
            name: 'Sarah Wilson',
            email: 'sarah.wilson@company.com',
            role: 'validator'
        },
        {
            id: 5,
            name: 'Bob Brown',
            email: 'bob.brown@company.com',
            role: 'requester'
        }
    ]);

    // Insert some sample vacation requests
    await knex('vacation_requests').insert([
        {
            user_id: 1,
            start_date: '2024-12-20',
            end_date: '2024-12-30',
            reason: 'Christmas vacation with family',
            status: 'pending'
        },
        {
            user_id: 2,
            start_date: '2024-11-15',
            end_date: '2024-11-17',
            reason: 'Long weekend trip',
            status: 'approved',
            validator_id: 3,
            comments: 'Approved - enjoy your trip!'
        },
        {
            user_id: 5,
            start_date: '2024-11-01',
            end_date: '2024-11-03',
            reason: 'Personal matters',
            status: 'rejected',
            validator_id: 4,
            comments: 'Rejected - insufficient notice period'
        }
    ]);
};