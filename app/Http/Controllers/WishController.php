<?php

namespace App\Http\Controllers;

use App\Models\Wish;
use Illuminate\Http\Request;

class WishController extends Controller
{
    /**
     * Store a newly created wish from the public invitation page.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'message' => 'required|string|max:1000',
        ]);

        Wish::create($validated);

        return redirect()->back()->with('success', 'Thank you for your beautiful wish!');
    }

    /**
     * Remove the specified wish (moderation).
     */
    public function destroy(Wish $wish)
    {
        $wish->delete();

        return redirect()->back()->with('success', 'Wish removed successfully.');
    }
}
