// https://www.digi.com/resources/documentation/digidocs/90001437-13/reference/r_iso_8601_duration_format.htm
export enum TimeUnit {
  day = 'D',
  hour = 'H',
  minute = 'M',
  second = 'S',
  milliSecond = 'MS'
}

export class Duration {
  private readonly duration: number;

  /**
   *
   * @param duration duration in milliseconds
   */
  private constructor(duration: number) {
    this.duration = duration;
  }

  millis(): number {
    return this.duration;
  }

  /**
   * Parses the given string as a duration
   * - D is the day designator that follows the value for the number of days.
   * - H is the hour designator that follows the value for the number of hours.
   * - M is the minute designator that follows the value for the number of minutes.
   * - S is the second designator that follows the value for the number of seconds.
   * @param str the duration string, eg. 1H or 60M
   */
  static parse(str: string): Duration {
    const match = str.match(/(\d+)(MS|ms|[DHMSdhms])/);
    if (!match) {
      throw new Error(`Failed to parse duration string: '${str}'`);
    }
    const duration = parseInt(match[1]);
    const unit = match[2];
    switch (unit.toUpperCase()) {
      case TimeUnit.day: return Duration.ofDays(duration);
      case TimeUnit.hour: return Duration.ofHours(duration);
      case TimeUnit.minute: return Duration.ofMinutes(duration);
      case TimeUnit.second: return Duration.ofSeconds(duration);
      case TimeUnit.milliSecond: return Duration.ofMilliSeconds(duration);
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
    return Duration.ofMilliSeconds(duration * 1000);
  }

  static ofMilliSeconds(duration: number): Duration {
    return new Duration(duration);
  }
}
