import {
  RichContentSegment,
  RichContentTextSegment,
  RichContentSegmentType,
  RichContentArticleSegment,
  RichContent,
} from '../models';

export class RichContentBuilder {
  private segments: RichContentSegment[] = [];

  public append(
    segment:
      | string
      | RichContentSegment
      | RichContentSegment[]
      | RichContent
      | RichContentBuilder,
  ): RichContentBuilder {
    if (typeof segment === 'string') {
      if (segment.length === 0) {
        return this;
      }

      if (
        this.segments.length > 0 &&
        this.segments[this.segments.length - 1].type ===
          RichContentSegmentType.Text
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

    if (segment instanceof RichContent) {
      segment.richContent.forEach((segment) => this.append(segment));

      return this;
    }

    if (
      segment.type === RichContentSegmentType.Text &&
      segment.content.length === 0
    ) {
      return this;
    }

    if (
      this.segments.length > 0 &&
      this.segments[this.segments.length - 1].type ===
        RichContentSegmentType.Text &&
      segment.type === RichContentSegmentType.Text
    ) {
      this.segments[this.segments.length - 1].content += segment.content;

      return this;
    }

    this.segments.push(segment);

    return this;
  }

  public build(): RichContent {
    return new RichContent(this.segments);
  }

  public forEachArticleSegment(
    callback: (article: RichContentArticleSegment, index: number) => void,
  ): RichContentBuilder {
    for (const [index, segment] of this.segments.entries()) {
      if (segment.type === RichContentSegmentType.Article) {
        callback(segment as RichContentArticleSegment, index);
      }
    }

    return this;
  }
}
