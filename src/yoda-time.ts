/**
 * Time functions - named after based on Joda-Time (https://www.joda.org/joda-time)
 */

export enum TimeUnit {
  day = 'd',
  hour = 'h',
  minute = 'm',
  second = 's',
  milliSecond = 'ms'
}

/**
 * An immutable duration specifying a length of time in milliseconds.
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
   * - m/mM is the minute designator that follows the value for the number of minutes.
   * - s/S is the second designator that follows the value for the number of seconds.
   * - ms/MS is the millisecond designator that follows the value for the number of milliseconds.
   * @param str the duration string, eg. 1H or 60M
   */
  static parse(str: string): Duration {
    const match = str.match(/(\d+)(MS|ms|[DHMSdhms])/);
    if (!match) {
      throw new Error(`Failed to parse duration string: '${str}'`);
    }
    const duration = parseInt(match[1]);
    const unit = match[2];
    switch (unit.toLowerCase()) {
      case TimeUnit.day: return Duration.ofDays(duration);
      case TimeUnit.hour: return Duration.ofHours(duration);
      case TimeUnit.minute: return Duration.ofMinutes(duration);
      case TimeUnit.second: return Duration.ofSeconds(duration);
      case TimeUnit.milliSecond: return Duration.ofMillis(duration);
      default: throw new Error(`Failed to parse duration string: '${str}'`);
    }
  }

  static ofDays(duration: number): Duration {
    return Duration.ofHours(duration * 24);
  }

  static ofHours(duration: number): Duration {
    return Duration.ofMinutes(duration * 60);
  }

  static ofMinutes(duration: number): Duration {
    return Duration.ofSeconds(duration * 60);
  }

  static ofSeconds(duration: number): Duration {
    return Duration.ofMillis(duration * 1000);
  }

  static ofMillis(duration: number): Duration {
    return new Duration(duration);
  }
}
