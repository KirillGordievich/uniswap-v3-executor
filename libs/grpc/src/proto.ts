import { join } from 'path';

// Resolved from this file, not process.cwd(): works from source (ts-jest), from dist
// (nest-cli.json copies the proto to dist/libs/grpc/proto) and in Docker.
export const SYNCER_PROTO_PATH = join(__dirname, '..', 'proto', 'syncer.proto');
