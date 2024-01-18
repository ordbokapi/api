import {
  RichContentSegment,
  RichContentTextSegment,
  RichContentType,
} from '../models';

export class RichContentBuilder {
  private segments: RichContentSegment[] = [];

  public append(
    segment:
      | string
      | RichContentSegment
      | RichContentSegment[]
      | RichContentBuilder,
  ): RichContentBuilder {
    if (typeof segment === 'string') {
      if (segment.length === 0) {
        return this;
      }

      if (
        this.segments.length > 0 &&
        this.segments[this.segments.length - 1].type === RichContentType.Text
      ) {
        this.segments[this.segments.length - 1].content += segment;
      } else {
        this.segments.push(new RichContentTextSegment(segment));
      }

      return this;
    }

    if (Array.isArray(segment)) {
      segment.forEach((segment) => this.append(segment));

      return this;
    }

    if (segment instanceof RichContentBuilder) {
      this.append(segment.build());

      return this;
    }

    if (segment.type === RichContentType.Text && segment.content.length === 0) {
      return this;
    }

    if (
      this.segments.length > 0 &&
      this.segments[this.segments.length - 1].type === RichContentType.Text &&
      segment.type === RichContentType.Text
    ) {
      this.segments[this.segments.length - 1].content += segment.content;

      return this;
    }

    this.segments.push(segment);

    return this;
  }

  public build(): RichContentSegment[] {
    return this.segments.slice();
  }

  public toString(): string {
    return this.segments.reduce((acc, segment) => acc + segment.content, '');
  }
}
