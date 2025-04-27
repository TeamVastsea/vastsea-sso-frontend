import { AutoRedis } from '@app/decorator';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { promises } from 'dns';
import { unlinkSync, writeFileSync } from 'fs';
import Redis, { Cluster } from 'ioredis';
import { join } from 'path';
import sharp from 'sharp';

const FILE_META = (fileHash: string) => `FILE::${fileHash}::REF::COUNTER`;

type FileMeta = {
  ref: number;
  path: string;
};
type StorageFile = {
  file: Buffer;
  path: string;
  hash: string;
  size: [number, number];
};
@Injectable()
export class UploadService {
  constructor(@AutoRedis() private redis: Redis | Cluster) {}

  async storageFile({ file, path, hash, size }: StorageFile) {
    const key = FILE_META(hash);
    const fileMeta = (await this.redis.hgetall(
      key,
    )) as unknown as FileMeta | null;
    if (fileMeta) {
      await this.redis.hincrby(key, 'ref', 1);
      return fileMeta.path;
    }
    return sharp(file)
      .resize(size[0], size[1], { fit: 'inside' })
      .webp({ quality: 95, nearLossless: true })
      .toBuffer()
      .then((buf) => {
        return writeFileSync(path, buf);
      })
      .then(() => {
        return this.redis
          .hmset(key, {
            path,
            ref: 0,
          } satisfies FileMeta)
          .then(() => hash);
      });
  }

  async refFile(fileHash: string) {
    const fileMeta = await this.redis.hgetall(FILE_META(fileHash));
    if (!fileMeta) {
      throw new HttpException('文件不存在', HttpStatus.NOT_FOUND);
    }
    await this.redis.hincrby(FILE_META(fileHash), 'ref', 1);
    return {
      ...fileMeta,
      ref: fileMeta.ref + 1,
    };
  }
  async unrefFile(fileHash: string) {
    const fileMeta = await this.getFileMeta(fileHash);
    if (!fileMeta) {
      throw new HttpException('文件不存在', HttpStatus.NOT_FOUND);
    }
    await this.redis.hincrby(FILE_META(fileHash), 'ref', -1);
    if (fileMeta.ref - 1 === 0) {
      unlinkSync(fileMeta.path);
    }
    return true;
  }
  async removeFile(fileHash: string) {
    const fileMeta = await this.getFileMeta(fileHash);
    if (!fileMeta) {
      throw new HttpException('文件不存在', HttpStatus.NOT_FOUND);
    }
    await this.redis.hset(FILE_META(fileHash), 'ref', 0);
    unlinkSync(fileMeta.path);
  }
  getFileMeta(fileHash: string) {
    return this.redis.hgetall(
      FILE_META(fileHash),
    ) as unknown as Promise<FileMeta | null>;
  }

  getFileHash(file: Buffer) {
    const hash = createHash('sha256');
    return hash.update(file).digest('base64url');
  }
  resolvePath(basePath: string, fileName: string) {
    return join(basePath, fileName);
  }
  resolveStorageParam(
    file: Express.Multer.File,
    path: string,
    hash: string,
  ): StorageFile {
    return { file: file.buffer, path, hash, size: [200, 200] };
  }
}
