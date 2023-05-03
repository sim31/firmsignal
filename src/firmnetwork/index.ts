import { Writable } from 'stream'
import firmcore, { newAccountWithAddress } from 'firmcore';
import { createDirectoryEncoderStream, CAREncoderStream, type FileLike } from 'ipfs-car'
import type { Link } from 'multiformats/link/interface'
import { Transform } from '@mui/icons-material';
import browserReadableStreamToIt from 'browser-readablestream-to-it';

async function * streamAsyncIterator (stream: ReadableStream) {
  // Get a lock on the stream
  const reader = stream.getReader();

  try {
    while (true) {
      // Read from the stream
      const { done, value } = await reader.read();
      // Exit if we're done
      if (done) return;
      // Else yield the chunk
      yield value;
    }
  } finally {
    reader.releaseLock();
  }
}

export default class FirmNetwork {
  async init () {
    const acc = newAccountWithAddress(
      { somePlat: 'aaa', somePlat2: 'bbb' },
      '0x6e2209e50d4ba5985a544325690efa929079df8f11ff5cceb9d97332c559b2e0',
      'Some name'
    );

    const file1 = new File(['Hello world!'], 'foo1.txt', {
      type: 'text/plain',
    });
    const file2 = new File(['hi! to you'], 'foo2.txt', {
      type: 'text/plain',
    });

    let rootCID: Link<any, any, any, any> | undefined;
    const stream = createDirectoryEncoderStream([file1, file2])
      .pipeThrough(new TransformStream({
        transform (block, controller) {
          rootCID = block.cid;
          // console.log('block1: ', block);
          controller.enqueue(block);
        }
      }))
      .pipeThrough(new CAREncoderStream());
      // .pipeThrough(new TransformStream({
      //   transform (block, controler) {
      //     // console.log('block2: ', block);
      //     for (const byte of block) {
      //       controler.enqueue(byte);
      //     }
      //   }
      // }))

    // const blobParts: Blob[] = [];
    // await stream.pipeTo(new WritableStream({
    //   write (chunk) {
    //     for (const byte of chunk) {
    //       blobParts.push(byte);
    //     }
    //   }
    // }));

    // const carFile = new File(blobParts, 'file');
    const it = browserReadableStreamToIt(stream)
    const blobParts: BlobPart[] = [];
    for await (const blob of it) {
      blobParts.push(blob);
    }

    // for await (const block of streamAsyncIterator(stream)) {
    //   console.log('block3: ', block);
    // }

    // const reader = stream.getReader();
    // const block = await reader.read();
    // const file = new Blob(['Hello ipfs-car!'])
    // const carStream = createFileEncoderStream(file).pipeThrough(new CAREncoderStream())

    // const response = await fetch(
    //   'ipfs://localhost/',
    //   {
    //     method: 'post',
    //     body: carStream,
    //     headers: {
    //       'Content-Type': 'application/vnd.ipld.car',
    //     },
    //     duplex: 'half',
    //   }
    // );

    console.log('root cid: ', rootCID?.toString());

    const response = await fetch(
      'ipfs://localhost/',
      {
        method: 'post',
        body: new Blob(blobParts, { type: 'application/car' }),
        headers: {
          'Content-Type': 'application/vnd.ipld.car',
        },
        duplex: 'half',
      }
    );

    console.log('root cid: ', rootCID?.toString());

    const url = response.headers.get('Location');
    console.log('status: ', response.status, 'url: ', url, 'results: ', (await response.body?.getReader().read())?.value, 'response: ', response);
  }
}
