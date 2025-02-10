<script lang="ts">
  let activities = [
    {
      id: 13238591234,
      name: 'Test - Primera del año',
      start_date: '2025-01-01T12:02:34Z',
      sport_type: 'GravelRide',
      distance: 19134.2,
      moving_time: 4388,
      elapsed_time: 7282,
      extra_data: {
        total_elevation_gain: 244,
      },
    },
  ];

  async function saveActivities() {
    try {
      const res = await fetch('/api/save-activities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activities }),
      });

      if (!res.ok) throw new Error(await res.text());
      alert('Activities saved successfully!');
    } catch (error) {
      console.error('Error saving activities:', error);
      alert('Failed to save activities.');
    }
  }
</script>

<button on:click={saveActivities}>Save Activities</button>
