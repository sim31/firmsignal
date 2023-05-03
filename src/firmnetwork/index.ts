import { Writable } from 'stream'
import firmcore, { newAccountWithAddress } from 'firmcore';
import { createDirectoryEncoderStream, CAREncoderStream, type FileLike, createFileEncoderStream } from 'ipfs-car'
import type { Link } from 'multiformats/link/interface'
import { Transform } from '@mui/icons-material';

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

    const blob1 = new Blob(['Hello world!']);
    const carStream1 = createFileEncoderStream(blob1).pipeThrough(new CAREncoderStream())
    const blob2 = new Blob(['hi! to you']);
    const carStream2 = createFileEncoderStream(blob2).pipeThrough(new CAREncoderStream());
    const files: FileLike[] = [
      { stream: () => carStream1, name: 'hello.txt' },
      { stream: () => carStream2, name: 'hello2.txt' },
      // { ...blob2, name: 'acc.json' }

    ];

    let rootCID: Link<any, any, any, any> | undefined;
    const stream = createDirectoryEncoderStream(files)
      .pipeThrough(new TransformStream({
        transform (block, controller) {
          rootCID = block.cid;
          // console.log('block1: ', block);
          controller.enqueue(block);
        }
      }))
      .pipeThrough(new CAREncoderStream())
      .pipeThrough(new TransformStream({
        transform (block, controler) {
          // console.log('block2: ', block);
          for (const byte of block) {
            controler.enqueue(byte);
          }
        }
      }))

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
        body: stream,
        headers: {
          'Content-Type': 'application/vnd.ipld.car',
        },
        duplex: 'half',
      }
    );

    console.log('root cid: ', rootCID?.toString());

    const url = response.headers.get('Location');
    console.log('status: ', response.status, 'url: ', url, 'results: ', (await response.body?.getReader().read())?.value);
  }
}
