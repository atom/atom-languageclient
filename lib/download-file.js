// @flow

import fs from 'fs';

export default async function downloadFile(sourceUrl: string, targetFile: string, progressCallback: ?ByteProgressCallback, length: ?number): Promise<void> {
  const request = new Request(sourceUrl, {
    headers: new Headers({'Content-Type': 'application/octet-stream'}),
  });

  const response = await fetch(request);
  if (!response.ok) {
    throw Error(`Unable to download, server returned ${response.status} ${response.statusText}`);
  }

  const body = response.body;
  if (body == null) {
    throw Error('No response body');
  }

  const finalLength = length || parseInt(response.headers.get('Content-Length' || '0'), 10);
  const reader = body.getReader();
  const writer = fs.createWriteStream(targetFile);

  await streamWithProgress(finalLength, reader, writer, progressCallback);
  writer.end();
}

async function streamWithProgress(length: number, reader: ReadableStreamReader, writer: fs.WriteStream, progressCallback: ?ByteProgressCallback): Promise<void> {
  let bytesDone = 0;

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
        const percent: ?number = length === 0 ? null : Math.floor(bytesDone / length * 100);
        progressCallback(bytesDone, percent);
      }
    }
  }
}

export type ByteProgressCallback = (bytesDone: number, percent: ?number) => {};
