<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use App\Models\Wish;
use App\Models\WeddingSetting;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class WeddingSettingController extends Controller
{
    /**
     * Render the public welcome/invitation page with dynamic props.
     */
    public function welcome()
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

        $guests = Guest::orderBy('name')->get(['name']);
        $wishes = Wish::latest()->get(['name', 'message', 'created_at']);

        return Inertia::render('welcome', [
            'settings' => $settings,
            'guests' => $guests,
            'wishes' => $wishes,
        ]);
    }

    /**
     * Update the wedding settings, including music upload.
     */
    public function update(Request $request)
    {
        $settings = WeddingSetting::firstOrCreate([]);

        $validated = $request->validate([
            'bride_name' => 'required|string|max:255',
            'groom_name' => 'required|string|max:255',
            'wedding_date' => 'required|date_format:Y-m-d H:i:s',
            'venue_name' => 'required|string|max:255',
            'venue_city' => 'required|string|max:255',
            'venue_address' => 'required|string|max:1000',
            'venue_maps_url' => 'required|string',
            'ceremony_time' => 'required|string|max:255',
            'reception_time' => 'required|string|max:255',
            'music_file' => 'nullable|file|mimes:mp3,wav|max:20480', // limit to 20MB
        ]);

        // Handle music file upload
        if ($request->hasFile('music_file')) {
            // Delete old file if exists
            if ($settings->music_path) {
                $relativeOldPath = str_replace(asset('storage/'), '', $settings->music_path);
                Storage::disk('public')->delete($relativeOldPath);
            }

            $file = $request->file('music_file');
            $path = $file->store('music', 'public');
            $validated['music_path'] = asset('storage/' . $path);
        }

        // Remove music_file key since it's not a database column
        unset($validated['music_file']);

        $settings->update($validated);

        return redirect()->back()->with('success', 'Wedding settings updated successfully.');
    }
}
