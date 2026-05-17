<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use App\Models\Wish;
use App\Models\WeddingSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Render the admin control panel dashboard.
     */
    public function index()
    {
        $settings = WeddingSetting::firstOrCreate([], [
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

        $guests = Guest::orderBy('name')->get();
        $wishes = Wish::latest()->get();

        return Inertia::render('dashboard', [
            'settings' => $settings,
            'guests' => $guests,
            'wishes' => $wishes,
        ]);
    }
}
