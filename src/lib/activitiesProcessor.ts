import type { Activity, Stats } from '$lib/types';

type Streak = {
  from: string; // format YYYY-MM-DD
  to: string;   // format YYYY-MM-DD
  days: number;
};

export class ActivitiesProcessor {
  public longestStreak: number = 0;
  public totalWorkouts: number = 0;
  public remainingDays: number;
  public from: Date;
  public to: Date;
  public today: Date = new Date();
  public activities: Activity[] = [];
  public activityDates = new Set();
  public skippedDates = new Set();
  public skippedDays: number = 0;
  public streaks: Streak[] = [];

  /**
   * Creates an instance of ActivitiesProcessor.
   * @param {Activity[]} activities - The activities to process.
   * @param {Date} from - The start date of the challenge.
   * @param {Date} to - The end date of the challenge.
   */
  constructor(activities: Activity[], from: Date, to: Date) {
    // Sort activities by date
    this.activities = [...activities].sort(
      (a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
    );

    this.from = from;
    this.to = to;

    this.totalWorkouts = this.activities.length;
    this.remainingDays = Math.ceil(
      (to.getTime() - this.today.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Calculate streaks within the activities
    this.calculateStreak();
  }

  /**
   * Calculate the longest streak within the activities.
   * This function loops through the given activities and their dates,
   * and calculates the longest streak of consecutive days with activities.
   * A streak is defined as a period of consecutive days that each contain
   * at least one activity. The function saves the longest streak in the
   * longestStreak property.
   */
  private calculateStreak(): void {
    // Add all dates from datetimes for each activity
    this.activities.forEach((activity) => {
      const date = new Date(activity.start_date).toISOString().split('T')[0];
      this.activityDates.add(date);
    });

    // Since activities are ordered from newest to oldest, 
    // the first activity date is the max date
    const lastActivityDate = [...this.activityDates][0] as string;

    // The reference date when starting a streak
    let stMovingDate = this.from.toISOString().split('T')[0];
    // The moving date on the loop
    let currentDate = this.from.toISOString().split('T')[0];
    let movingStreak = 0;

    while (currentDate <= lastActivityDate) {
      if (this.activityDates.has(currentDate)) {
        movingStreak++;
      } else {
        // If we got here, it means that 
        // the previous date was the end of the streak

        // Add current date to skipped dates
        this.skippedDays++;
        // TODO: Add skippedDates!

        // Calc previous date
        const previousDate = new Date(currentDate);
        previousDate.setDate(new Date(currentDate).getDate() - 1);

        // Add previous period to streaks list
        this.streaks.push({
          from: stMovingDate,
          to: previousDate.toISOString().split('T')[0],
          days: movingStreak,
        });

        // Reset the values for the next iteration
        movingStreak = 0;
        previousDate.setDate(previousDate.getDate() + 2);
        stMovingDate = previousDate.toISOString().split('T')[0];
      }

      if (currentDate === lastActivityDate) {
        // If we got here, it means that the last date 
        // with an activity is included in the last streak
        this.streaks.push({
          from: stMovingDate,
          to: currentDate,
          days: movingStreak,
        });
        break;
      }

      // Increase the moving date to keep on the loop
      const tempDate = new Date(currentDate);
      tempDate.setDate(tempDate.getDate() + 1);
      currentDate = tempDate.toISOString().split('T')[0];
    }

    // Finally, calculate the longest streak from the streaks list
    this.longestStreak = this.streaks.reduce((a, b) =>
      a.days > b.days ? a : b
    ).days;
    // TODO: save longestStreak as object?
  }

  /**
   * Groups and counts the number of activities by date.
   * @returns An object where the keys are dates and the values are the number of activities for each date.
   */
  public grouppedByDate(): Record<string, number> {
    // Group and count the number of activities by date
    const activitiesByDate = this.activities.reduce(
      (acc, activity) => {
        const date = new Date(activity.start_date).toISOString().split('T')[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log('Activities by Date: ', activitiesByDate);
    return activitiesByDate;
  }

  /**
   * Get the calculated stats for the activities.
   * @returns An object with the following stats:
   * - `longestStreak`: The longest streak of activities.
   * - `totalWorkouts`: The total number of activities.
   * - `remainingDays`: The number of days remaining until the end date.
   * - `skippedDays`: The number of skipped days.
   */
  public getStats(): Stats {
    return {
      longestStreak: this.longestStreak,
      totalWorkouts: this.totalWorkouts,
      remainingDays: this.remainingDays,
      skippedDays: this.skippedDays,
    };
  }
}
