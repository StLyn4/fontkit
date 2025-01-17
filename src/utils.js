import { DecodeStream, EncodeStream } from 'restructure';

export function binarySearch(arr, cmp) {
  let min = 0;
  let max = arr.length - 1;
  while (min <= max) {
    let mid = (min + max) >> 1;
    let res = cmp(arr[mid]);

    if (res < 0) {
      max = mid - 1;
    } else if (res > 0) {
      min = mid + 1;
    } else {
      return mid;
    }
  }

  return -1;
}

export function range(index, end) {
  let range = [];
  while (index < end) {
    range.push(index++);
  }
  return range;
}

export const asciiDecoder = new TextDecoder('ascii');

// Based on https://github.com/niklasvh/base64-arraybuffer. MIT license.
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const LOOKUP = new Uint8Array(256);
for (let i = 0; i < CHARS.length; i++) {
  LOOKUP[CHARS.charCodeAt(i)] = i;
}

export function decodeBase64(base64) {
  let bufferLength = base64.length * 0.75;

  if (base64[base64.length - 1] === '=') {
    bufferLength--;
    if (base64[base64.length - 2] === '=') {
      bufferLength--;
    }
  }

  let bytes = new Uint8Array(bufferLength);
  let p = 0;

  for (let i = 0, len = base64.length; i < len; i += 4) {
    let encoded1 = LOOKUP[base64.charCodeAt(i)];
    let encoded2 = LOOKUP[base64.charCodeAt(i + 1)];
    let encoded3 = LOOKUP[base64.charCodeAt(i + 2)];
    let encoded4 = LOOKUP[base64.charCodeAt(i + 3)];

    bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
    bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
    bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
  }

  return bytes;
}

export class Version16Dot16 {
  fromBuffer(buffer) {
    let stream = new DecodeStream(buffer);
    return this.decode(stream);
  }

  toBuffer(value) {
    let size = this.size(value);
    let buffer = new Uint8Array(size);
    let stream = new EncodeStream(buffer);
    this.encode(stream, value);
    return buffer;
  }

  size() {
    return 4;
  }

  decode(stream) {
    let major = stream.readUInt16BE();
    let minor = stream.readUInt16BE() >> 12;
    return major + minor / 10;
  }

  encode(stream, val) {
    let major = Math.trunc(val);
    let minor = (val - major) * 10;
    stream.writeUInt16BE(major);
    return stream.writeUInt16BE(minor << 12);
  }
}

export const version16Dot16 = new Version16Dot16();
