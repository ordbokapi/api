import { Injectable } from '@nestjs/common';
import { promisify } from 'util';
import { brotliCompress, brotliDecompress } from 'zlib';

@Injectable()
export class CacheSerializationProvider {
  private readonly brotliCompressAsync = promisify(brotliCompress);
  private readonly brotliDecompressAsync = promisify(brotliDecompress);

  public async serialize(data: any): Promise<Buffer> {
    return this.brotliCompressAsync(Buffer.from(JSON.stringify(data)));
  }

  public async deserialize(data: Buffer): Promise<any> {
    return JSON.parse((await this.brotliDecompressAsync(data)).toString());
  }
}
