import * as fs from 'fs';

/**
 * Public: Download a file and store it on a file system using streaming with appropriate progress callback.
 *
 * @param sourceUrl Url to download from.
 * @param targetFile File path to save to.
 * @param progressCallback Callback function that will be given a {ByteProgressCallback} object containing
 *   both bytesDone and percent.
 * @param length File length in bytes if you want percentage progress indication and the server is
 *   unable to provide a Content-Length header and whitelist CORS access via a
 *   `Access-Control-Expose-Headers "content-length"` header.
 * @returns A {Promise} that will accept when complete.
 */
export default (async function downloadFile(
  sourceUrl: string,
  targetFile: string,
  progressCallback?: ByteProgressCallback,
  length?: number,
): Promise<void> {
  const request = new Request(sourceUrl, {
    headers: new Headers({ 'Content-Type': 'application/octet-stream' }),
  });

  const response = await fetch(request);
  if (!response.ok) {
    throw Error(`Unable to download, server returned ${response.status} ${response.statusText}`);
  }

  const body = response.body;
  if (body == null) {
    throw Error('No response body');
  }

  const finalLength = length || parseInt(response.headers.get('Content-Length') || '0', 10);
  const reader = body.getReader();
  const writer = fs.createWriteStream(targetFile);

  await streamWithProgress(finalLength, reader, writer, progressCallback);
  writer.end();
});

/**
 * Stream from a {ReadableStreamReader} to a {WriteStream} with progress callback.
 *
 * @param length File length in bytes.
 * @param reader A {ReadableStreamReader} to read from.
 * @param writer A {WriteStream} to write to.
 * @param progressCallback Callback function that will be given a {ByteProgressCallback} object containing
 *   both bytesDone and percent.
 * @returns A {Promise} that will accept when complete.
 */
async function streamWithProgress(
  length: number,
  reader: ReadableStreamReader,
  writer: fs.WriteStream,
  progressCallback?: ByteProgressCallback,
): Promise<void> {
  let bytesDone = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const result = await reader.read();
    if (result.done) {
      if (progressCallback != null) {
        progressCallback(length, 100);
      }
      return;
    }

    const chunk = result.value;
    if (chunk == null) {
      throw Error('Empty chunk received during download');
    } else {
      writer.write(Buffer.from(chunk));
      if (progressCallback != null) {
        bytesDone += chunk.byteLength;
        const percent: number | undefined = length === 0 ? undefined : Math.floor(bytesDone / length * 100);
        progressCallback(bytesDone, percent);
      }
    }
  }
}

/**
 * Public: Progress callback function signature indicating the bytesDone and
 * optional percentage when length is known.
 */
export type ByteProgressCallback = (bytesDone: number, percent?: number) => void;
