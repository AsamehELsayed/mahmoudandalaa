<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Ensure test user exists for login
        if (!User::where('email', 'mahmoud&alaa@asameh.com')->exists()) {
            User::factory()->create([
                'name' => 'mahmoud&alaa',
                'email' => 'mahmoud&alaa@asameh.com',
                'password' => bcrypt('Wqei@31234'),
            ]);
        }

        // Seed default Wedding Settings
        \App\Models\WeddingSetting::firstOrCreate([], [
            'bride_name' => 'alaa',
            'groom_name' => 'mahmoud',
            'wedding_date' => '2026-08-15 18:00:00',
            'venue_name' => 'Four Seasons Hotel',
            'venue_city' => 'San Stefano, Alexandria',
            'venue_address' => '399 El Geish Road, San Stefano, Alexandria, Egypt',
            'venue_maps_url' => 'https://www.google.com/maps/search/?api=1&query=Four+Seasons+Hotel+Alexandria+at+San+Stefano',
            'ceremony_time' => "Six o'clock in the evening",
            'reception_time' => "Eight o'clock in the evening",
            'music_path' => null,
        ]);

        // Seed default Guest List
        $guests = [
        //     ['name' => 'Ahmed & Family'],
        //     ['name' => 'Sarah & Guest'],
        //     ['name' => 'Omar Ziad'],
        //     ['name' => 'Laila & Mohamed'],
        //     ['name' => 'Hoda & Family'],
        //     ['name' => 'Zainab Alaa'],
        //     ['name' => 'Mostafa Mahmoud'],
        //     ['name' => 'Nouran & Family'],
        //     ['name' => 'Youssef Ibrahim'],
        // ];
        ];

        foreach ($guests as $guest) {
            \App\Models\Guest::firstOrCreate(['name' => $guest['name']], $guest);
        }
    }
}
