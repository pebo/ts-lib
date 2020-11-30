// Time functions - named after the Joda-Time library (https://www.joda.org/joda-time)

export const TimeConstants = {
  MILLIS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MILLIS_PER_MINUTE: 60000,
  MINUTES_PER_HOUR: 60,
  SECONDS_PER_HOUR: 3600,
  MILLIS_PER_HOUR:  3600000,
  MILLIS_PER_DAY: 86400000
}

 /**
  * TimeUnit represents time durations at a given unit of granularity.
  */
export enum TimeUnit {
  days = 'd',
  hours = 'h',
  minutes = 'm',
  seconds = 's',
  milliseconds = 'ms'
}

/**
 * Duration represents immutable duration specifying a length of time in milliseconds.
 */
export class Duration {
  private readonly duration: number;

  /**
   * Constructs an instance of the class.
   * @param duration duration in milliseconds
   */
  private constructor(duration: number) {
    this.duration = duration;
  }

  millis(): number {
    return this.duration;
  }

  isGreaterThan(other: Duration): boolean {
    return this.duration > other.duration;
  }

  isLessThan(other: Duration): boolean {
    return this.duration < other.duration;
  }

  /**
   * Parses the given string as a duration.
   * - d/D is the day designator that follows the value for the number of days.
   * - h/H is the hour designator that follows the value for the number of hours.
   * - m/M is the minute designator that follows the value for the number of minutes.
   * - s/S is the second designator that follows the value for the number of seconds.
   * - ms/MS is the millisecond designator that follows the value for the number of milliseconds.
   * @param str the duration string, eg. 1h or 60m
   */
  static parse(str: string): Duration {
    const match = str.match(/^(-?\d+)(MS|ms|[DHMSdhms])/);
    if (!match) {
      throw new Error(`Failed to parse duration string: '${str}'`);
    }
    const duration = parseInt(match[1]);
    const unit = match[2];
    return Duration.ofUnitString(duration, unit);
  }


  private static ofUnitString(duration: number, unit: string): Duration {
    switch (unit.toLowerCase()) {
      case TimeUnit.days: return Duration.ofDays(duration);
      case TimeUnit.hours: return Duration.ofHours(duration);
      case TimeUnit.minutes: return Duration.ofMinutes(duration);
      case TimeUnit.seconds: return Duration.ofSeconds(duration);
      case TimeUnit.milliseconds: return Duration.ofMillis(duration);
      default: throw new Error(`Unknown time unit: '${unit}'`);
    }
  }

  static ofUnit(duration: number, unit: TimeUnit): Duration {
    return Duration.ofUnitString(duration, unit);
  }

  static ofDays(duration: number): Duration {
    return Duration.ofMillis(duration * TimeConstants.MILLIS_PER_DAY);
  }

  static ofHours(duration: number): Duration {
    return Duration.ofMillis(duration * TimeConstants.MILLIS_PER_HOUR);
  }

  static ofMinutes(duration: number): Duration {
    return Duration.ofMillis(duration * TimeConstants.MILLIS_PER_MINUTE);
  }

  static ofSeconds(duration: number): Duration {
    return Duration.ofMillis(duration * TimeConstants.MILLIS_PER_SECOND);
  }

  static ofMillis(duration: number): Duration {
    return new Duration(duration);
  }
}
