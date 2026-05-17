<?php

namespace App\Http\Controllers;

use App\Models\Guest;
use Illuminate\Http\Request;

class GuestController extends Controller
{
    /**
     * Store a newly created guest.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        Guest::create($validated);

        return redirect()->back()->with('success', 'Guest added successfully.');
    }

    /**
     * Update the specified guest.
     */
    public function update(Request $request, Guest $guest)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $guest->update($validated);

        return redirect()->back()->with('success', 'Guest updated successfully.');
    }

    /**
     * Remove the specified guest.
     */
    public function destroy(Guest $guest)
    {
        $guest->delete();

        return redirect()->back()->with('success', 'Guest removed successfully.');
    }

    /**
     * Batch store multiple guests (new-line separated list).
     */
    public function batchStore(Request $request)
    {
        $validated = $request->validate([
            'names_list' => 'required|string',
        ]);

        // Split by new line, carriage return, or comma, then filter empty items
        $names = preg_split('/[\r\n,]+/', $validated['names_list']);
        $addedCount = 0;

        foreach ($names as $name) {
            $cleanedName = trim($name);
            if (!empty($cleanedName)) {
                Guest::create([
                    'name' => $cleanedName,
                ]);
                $addedCount++;
            }
        }

        return redirect()->back()->with('success', "$addedCount guests imported successfully.");
    }
}
