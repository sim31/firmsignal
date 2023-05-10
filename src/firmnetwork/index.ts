import firmcore, { newAccountWithAddress } from 'firmcore';
import { CarWriter } from '@ipld/car/writer'
import { importer, type FileCandidate, type DirectoryCandidate } from 'ipfs-unixfs-importer'
import browserReadableStreamToIt from 'browser-readablestream-to-it'
import { MemoryBlockstore } from 'blockstore-core';

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
    const fileInDir = new File([JSON.stringify(acc)], 'acc.json');
    const accChanged = {
      ...acc,
      extAccounts: {
        ...acc.extAccounts,
        somePlat: 'ddd',
      }
    }
    const file2InDir = new File([JSON.stringify(accChanged)], 'accChanged.json');

    const encoder = new TextEncoder();

    const fileEntries: Array<FileCandidate | DirectoryCandidate> = [
      {
        path: 'foo1.txt',
        content: encoder.encode('Hello world!'),
      },
      {
        path: 'foo2.txt',
        content: encoder.encode('hi! to you'),
      },
      {
        path: 'accounts',
      },
      {
        path: 'accounts/acc.json',
        content: encoder.encode(JSON.stringify(acc))
      },
      {
        path: 'accounts/accChanged.json',
        content: encoder.encode(JSON.stringify(accChanged))
      }
    ]

    const blockstore = new MemoryBlockstore();

    const unixFsEntries = []
    for await (const entry of importer(fileEntries, blockstore)) {
      unixFsEntries.push(entry)
    }

    const rootEntry = unixFsEntries[unixFsEntries.length - 1];
    if (rootEntry !== undefined) {
      const rootCID = rootEntry.cid;
      console.log('root CID: ', rootCID.toString());

      const { writer, out } = CarWriter.create(rootCID);
      for await (const block of blockstore.getAll()) {
        await writer.put({ ...block, bytes: block.block });
      }
      await writer.close()

      const carParts = new Array<Uint8Array>();
      for await (const chunk of out) {
        carParts.push(chunk)
      }
      const carFile = new Blob(carParts, {
        type: 'application/car',
      });

      const response = await fetch(
        'ipfs://localhost/',
        {
          method: 'post',
          body: carFile,
          headers: {
            'Content-Type': 'application/vnd.ipld.car',
          },
          // duplex: 'half',
        }
      );

      const resBody = await response.text();

      console.log('status: ', response.status, 'results: ', resBody);
    }
  }
}
